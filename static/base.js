function loadComponent(url, elementId) {
        fetch(url)
                .then(response => response.text())
                .then(data => {
                        document.getElementById(elementId).innerHTML = data;
                })
                .catch(error => console.error('Error loading component:', error));
}

window.addEventListener('load', function() {
        document.body.querySelector("main").classList.add('loaded');

        loadComponent('./static/header.html', 'header');
        loadComponent('./static/footer.html', 'footer');
});
