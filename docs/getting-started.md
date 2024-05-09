# Getting Started

This document will walk you throught the process of building and running the Lost Mud environment locally.

## Overview
The Lost Must consists of 3 components.
- **The Lost Mud Webapp** - This is a single page application written in Vue.JS. It functions as the browser interface to the game.
- **The MudSocket** - This service written for Node.JS acts as a bridge between the Webapp, and the mud. The mud was only built with telnet support, so the MudSocket receives websocket connections from the webapp, and connects them through telnet to the mud.
- **The Mud** - this is the original ROM2.4b6 DIKU / MERC mud with some minor modifications.

## Prerequisite
The following build tools are required:
I use GitHub CLI to checkout the code. You're free to use whatever, but the examples will use the CLI (gh).

**Operating System** All three applications work on MacOS or Linux. Windows is untusted.
**IDE** I really prefer VSCode. Once configured, you can quickly open up a workspace in the root of a project with ```code .```. To configure that see: [VSCode Mac Setup](https://code.visualstudio.com/docs/setup/mac)

**The Lost Mud WebApp**
- Node.js (I'm using version 20.x, any modern version will do)

**The Mud Socket**
- Node.js

**The Mud**
- Standard C build tools (make, gcc, ld)

In this guide you will checkout 3 different projects. I recommend making a workspace directory to serve as the root. The structure looks like this:
```console
workspace/
├─ rom24-quickmud/
├─ wsserver/
├─ lostmud/
```

## Setting up The Mud
1. First clone the reponsitory.
```console
gh repo clone mzahalan/rom24-quickmud
```
2. Navigate into the src directory, and run Make.
```console
cd rom24-quickmud/src/
make
```
::: info
There will be several warnings, but it should compile.
:::

When this finishes, the output executable will be placed in the ../area directory.

3. Try running the mud

::: tip
You must run the mud within the Area directory. The file paths are hard coded.
:::

```console
cd ../area
./rom
```
Several messages will be displayed on the console, but it should end with something like:
```console
Wed May  8 21:24:26 2024 :: Check Levels:
Wed May  8 21:24:26 2024 ::   Object: (VNUM  9216)(Level 25) an ice staff
Wed May  8 21:24:26 2024 ::      Mob: (VNUM  9235)(Level 16) a baby rainbow dragon
Wed May  8 21:24:26 2024 :: Check Levels:
Wed May  8 21:24:26 2024 ::   Object: (VNUM  8010)(Level  5) a wet noodle
Wed May  8 21:24:26 2024 ::      Mob: (VNUM  8002)(Level 17) a Futsie
Wed May  8 21:24:26 2024 :: ROM is ready to rock on port 4000 (0.0.0.0).  // [!code focus]
Wed May  8 21:24:26 2024 :: IMC: Loading IMC2 command table...
Wed May  8 21:24:26 2024 :: IMC: Loading IMC2 network data...
Wed May  8 21:24:26 2024 :: IMC: Loading IMC2 help file...
Wed May  8 21:24:26 2024 :: IMC: Loading IMC2 color table...
Wed May  8 21:24:26 2024 :: IMC: Loading IMC2 who template...
Wed May  8 21:24:26 2024 :: IMC: imcfread_word: EOF encountered on read.
Wed May  8 21:24:26 2024 :: IMC: IMC2 network data loaded. Autoconnect not set. IMC2 will need to be connected manually.
```
Note the important line **ROM is ready to rock on port 4000**

**CONGRATULATIONS You're Running the Mud!**
You can test your mud by telneting into it.
```console
telnet localhost 4000
```

**Output**
```console
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.


THIS IS A MUD BASED ON.....

                                ROM Version 2.4 beta

               Original DikuMUD by Hans Staerfeldt, Katja Nyboe,
               Tom Madsen, Michael Seifert, and Sebastian Hammer
               Based on MERC 2.1 code by Hatchet, Furey, and Kahn
               ROM 2.4 copyright (c) 1993-1998 Russ Taylor

By what name do you wish to be known? 
```

::: info
You just checked out the mud, that means there are no player files in the ../players directory. You'll have to create a player to proceed (or copy your player file in)
:::

Leave the mud running and proceed to the next step.

## Setting up the MudSocket
1. In your workspace directory checkout the wsserver project
```console
gh repo clone mzahalan/wsserver
```
2. Navigate into that directory and install the dependencies.
```console
cd wsserver
npm install
```
If your mud is running you can test the connection using the test driver:
```console
node testDriver.js
```
3. If everything looks good, launch your MudSocket Application with npm.
```console
npm run dev
```
**Output**
```console
> wsserver@1.0.0 dev
> node index.js

Server listening on port 9081
```

Leave your MudSocket running and proceed to the next step.

## Setting up the Lost Mud Web Application
1. In your workspace directory checkout the Lost Mud App.
```console
gh repo clone mzahalan/lostmud
```
2. Navigate into that directory and install the dependencies.
```console
cd lostmud
npm install
```
3. Change the Socket Connection for Local Testing
This is the tricky bit - as of right now there's an outstanding TODO to have a Environment based configuration. For Prod we use WSS (https websockets on port 443), for local testing we use WS (regular websockets on port 9081). To configure your setup for local testing have a look at the following two lines in ```lostmud/src/stores/mudconnect.js```
```js
    sock.value = new WebSocket('wss://socket.lostmud.com')
    //sock.value = new WebSocket('ws://localhost:9081')
```
Comment out the first line, and uncomment out the second line. If you don't change these, then when you test in the next step, you'll be connected to the prod MUD.
::: danger STOP!
Be sure to never commit these changes, or you break prod. There are no integration tests (yet)
:::
4. Run your web service locally.
From the root directory run:
```console
npm run dev
```
**Output**
```console

> lostmud@0.0.0 dev
> vite

Port 5173 is in use, trying another one...

  VITE v5.2.11  ready in 862 ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
  ➜  Vue DevTools: Open http://localhost:5174/__devtools__/ as a separate window
  ➜  Vue DevTools: Press Option(⌥)+Shift(⇧)+D in App to toggle the Vue DevTools

  ➜  press h + enter to show help

```
::: tip
If you press ```o [enter]``` in that console it will launch your browser for you.
:::
::: tip Fun Fact
When this service is running, changes made to files will be reflected automatically upon saving.
:::

5. Connect to your mud through your browser. You did it.


