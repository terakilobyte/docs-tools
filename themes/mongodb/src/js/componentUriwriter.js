class UriwriterSingleton {
    constructor(key) {
        console.log('setting up uriwriter');
        this.key = key;
        this.uri = document.querySelectorAll('.uriwriter');
        console.log(this.uri);
    }
    setup() {
        console.log('Setting up write event listener');
        document.addEventListener('uriwriter', () => {
            // var replaceString = getReplaceString();
        });
        document.getElementById('uriwriter_add').addEventListener('click', (event) => {
            console.log('clicked add');
            console.log(event);

        });
    }

    getReplaceString() {
        return localStorage.getItem('uristring');
    }
}

// Create Uriwriter
export function setup() {
    (new UriwriterSingleton('uriwriter')).setup();
}
