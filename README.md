# Tiny Url Generator

BITS Goa's very own tiny url generator for shortening urls.
---
## Requirements

For development, you will only need Node.js, MongoDB and project dependencies.

### Node
- #### Node installation on Windows

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v8.11.3

    $ npm --version
    6.1.0

### MongoDB
- #### MongoDB installation on Ubuntu

  You can install mongodb locally by :

      $ sudo apt install mongodb

## Install

    $ git clone https://github.com/Devsoc-BPGC/Short-Me
    $ cd Short-Me
    $ npm install


## Running the project in dev mode

    $ node server/admintest.js
    $ npm run dev

## TODO

- [ ] Verifyfing whether the email registered is valid.
- [ ] Verifying whether the url entered is valid
- [x] Fixing error of push coming sometimes
- [x] remove redirects everywhere and give responses in the text mentioned at whatsapp
- [x] fixing x-auth token verification. Any token is working
- [x] passing x-auth token in headers
- [ ] check customCode does not contain spaces, new line character
- [x] email checking isn't caps sensitive
