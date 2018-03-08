

class UriwriterSingleton {
    
    constructor(key) {
        this.key = key;
        this.uri = document.querySelectorAll('.uriwriter');
        console.log(this.uri)

        // Only tab sets will have a type, init and try to retrieve

    }

  }

// Create Uriwriter
export function setup() {
    (new UriwriterSingleton('uriwriter')).setup();
}
