let deferredPrompt;


window.addEventListener('beforeinstallprompt', (event) => {

    event.preventDefault();

    deferredPrompt = event;

    document.getElementById('install-button').style.display = 'block';

});


document.getElementById('install-button').addEventListener('click', () => {

    if (deferredPrompt) {

        deferredPrompt.prompt();

        deferredPrompt.userChoice.then((choiceResult) => {

            if (choiceResult.outcome === 'accepted') {

                console.log('User accepted the install prompt');

            }

            deferredPrompt = null;

        });

    }

});


window.addEventListener('appinstalled', () => {

    console.log('PWA installed');

    document.getElementById('install-button').style.display = 'none';

});