function iniciarApp(){
    const selectCategorias = document.querySelector('#categorias');

    const resultado = document.querySelector('#resultado');
    const modal = new bootstrap.Modal('#modal', {});

    if(selectCategorias){
        selectCategorias.addEventListener('change', seleccionarCategorias);
        obtenerCategorias();
    };

    const favoritosDIv = document.querySelector('.favoritos');

    if(favoritosDIv){
        obtenerFavoritos();
    };

    function obtenerCategorias(){
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
        fetch(url)
            .then(resultado=>resultado.json())
            .then(valores=>mostrarCategorias(valores.categories))
            .catch(error=>console.log(error))
    };

    function mostrarCategorias(categorias = []){
        categorias.forEach(categoria=>{
            const {strCategory} = categoria;
            const option = document.createElement('OPTION');
            option.value = strCategory;
            option.textContent = strCategory;
            selectCategorias.appendChild(option);
        });
        };

    function seleccionarCategorias(e){
        const categoriaSelec = e.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoriaSelec}`;
        fetch(url)
            .then(valores=>valores.json())
            .then(resultado=>mostrarRecetas(resultado.meals));

    };
    function mostrarRecetas(recetas =[]){
        limpiarHtml(resultado);

        const heading = document.createElement('H2');
        heading.classList.add('text-center', 'text-black', 'my-5');
        heading.textContent = recetas.length ? 'Resultados encontrados' : 'No se han encontrado resultados';

        resultado.appendChild(heading);

        //Iterar los resultados
        recetas.forEach(receta=>{
            const {idMeal, strMeal, strMealThumb} = receta;

            //Iterar en los resultados
            const recetaContenedor = document.createElement('DIV');
            recetaContenedor.classList.add('col-md-4');
           
            const recetaCard = document.createElement('DIV');
            recetaCard.classList.add('card', 'mb-4');

            const recetaImg = document.createElement('IMG');
            recetaImg.classList.add('card-img-top');
            recetaImg.alt = `Nombre de la receta${strMeal ?? receta.titulo}`;
            recetaImg.src = strMealThumb ?? receta.img;

            const recetaCardBody = document.createElement('DIV');
            recetaCardBody.classList.add('card-body');

            const recetaHeading = document.createElement('H3');
            recetaHeading.classList.add('card-title', 'mb-3');
            recetaHeading.textContent = strMeal ?? receta.titulo;

            const recetaButton = document.createElement('BUTTON');
            recetaButton.classList.add('btn', 'btn-danger', 'w-100');
            recetaButton.textContent = 'Ver receta';
            recetaButton.dataset.bsTarget = '#modal';
            recetaButton.dataset.bsToggle = 'modal';
            recetaButton.onclick =  function(){
                seleccionarReceta(idMeal ?? receta.id);
            };

            //Inyectar en el HTML
            recetaCardBody.appendChild(recetaHeading);
            recetaCardBody.appendChild(recetaButton);

            recetaCard.appendChild(recetaImg);
            recetaCard.appendChild(recetaCardBody);

            recetaContenedor.appendChild(recetaCard);

            resultado.appendChild(recetaContenedor);
        });
    };

    function seleccionarReceta(id){
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        fetch(url)
            .then(resultado=> resultado.json())
            .then(valores=>mostrarRecetaModal(valores.meals[0]));
    };

    function mostrarRecetaModal(receta){
        const{idMeal, strMeal, strInstructions, strMealThumb}= receta;

        //Añadir contenido al modal
        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body')

        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
        <img class="img-fluid" src="${strMealThumb}" alt="receta${strMeal}">
        <h3 class="my-3">Intrucciones</h3>
        <p>${strInstructions}</p>
        <h3 class"my-3">Ingredientes y cantidades</h3>
        `
        const listGroup = document.createElement('UL');
        listGroup.classList.add('list-group');
        //Mostrar cantidades e ingredientes
        for(let i = 1; i<=20; i++){
            if(receta[`strIngredient${i}`]){
                const ingrediente = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];
                
                const ingredienteLi = document.createElement('LI');
                ingredienteLi.classList.add('list-group-item');
                ingredienteLi.textContent = `${ingrediente} - ${cantidad}`;

                listGroup.appendChild(ingredienteLi);
            };
        };

        modalBody.appendChild(listGroup);

        const modalFooter = document.querySelector('.modal-footer');
        limpiarHtml(modalFooter);

        //Botones de cerrar y favorito
        const btnFavorito = document.createElement('BUTTON');
        btnFavorito.classList.add('btn', 'btn-danger', 'col');
        btnFavorito.textContent = comprobarStorage(idMeal) ? 'Eliminar favorito' : 'Agregar a favoritos';

        //Almacenar en LocalStorage
        btnFavorito.onclick = function(){

            if(comprobarStorage(idMeal)){
                eliminarFavorito(idMeal);
                btnFavorito.textContent = 'Agregar a favoritos';
                mostrarToast('Eliminado con éxito');
                return;
            };
            agregarFavorito({
                id: idMeal,
                titulo: strMeal,
                img: strMealThumb,
            });
            mostrarToast('Agregado correctamente');
            btnFavorito.textContent = 'Eliminar favorito';

        };

        const btnCerrarModal = document.createElement('BUTTON');
        btnCerrarModal.classList.add('btn', 'btn-secondary', 'col');
        btnCerrarModal.textContent = 'Cerrar';

        btnCerrarModal.onclick = function(){
            modal.hide();
        };

        modalFooter.appendChild(btnFavorito);
        modalFooter.appendChild(btnCerrarModal);

        //Muestra el modal
        modal.show();
    };

    function agregarFavorito(receta){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]));
    };

    function eliminarFavorito(id){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        const nuevosFavoritos = favoritos.filter(favorito=> favorito.id !== id);
        localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));
    };

    function comprobarStorage(id){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        return favoritos.some(favorito => favorito.id === id);
    };

    function mostrarToast(mensaje){
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = mensaje;
        toast.show();
    };

    function obtenerFavoritos(){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        localStorage.setItem('favoritos', JSON.stringify(favoritos));
        if(favoritos.length){
            mostrarRecetas(favoritos);
            return;
        };

        const noFavoritos = document.createElement('P');
        noFavoritos.textContent = 'No se han agregado favoritos aún';
        noFavoritos.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');
        resultado.appendChild(noFavoritos);
    };

    function limpiarHtml(selector){
        while(selector.firstChild){
            selector.removeChild(selector.firstChild);
        }
    };
};

document.addEventListener('DOMContentLoaded', iniciarApp);
