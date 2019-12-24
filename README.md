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

    $ git clone https://github.com/Devsoc-BPGC/Tiny-Url
    $ cd Tiny-Url
    $ npm install


## Running the project in dev mode

    $ npm run dev

## TODO

- [x] Use form.urlencoded method to extract url data
- [ ] Alternative for `valid-url` module to check urls
- [x] Make code 6 digit psuedo-random.
- [x] Add option for the user to give custom short url
