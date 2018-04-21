const COLLAPSED_PROPERTY = 'apiref-resource--collapsed';

function toggleResource(classListAction, resourceElement) {
    if (resourceElement.id) {
        const hash = `#${resourceElement.id}`;
        window.history.pushState({'href': hash}, '', hash);
    }

    resourceElement.classList[classListAction](COLLAPSED_PROPERTY);
}

function expand() {
    const requested = document.getElementById(document.location.hash.slice(1));
    if (!requested) { return; }
    if (!requested.classList.contains('apiref-resource')) { return; }
    toggleResource('remove', requested);
}

window.addEventListener('hashchange', expand, false);

export function setup() {
    const resourceHeaderElements = document.getElementsByClassName('apiref-resource__header');
    for (let i = 0; i < resourceHeaderElements.length; i += 1) {
        const element = resourceHeaderElements[i];
        element.onclick = toggleResource.bind(null, 'toggle', element.parentElement);
    }

    expand();
}
