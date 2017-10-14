# Chippie
React + JS based CHIP-8 emulator

## Instructions

To run call `yarn dev` or `npm run dev`

## TODO

- Change 'clock delay' to 'clock rate' ie. 1.0 for 60hz 0.5 for 30hz etc?
- It seems that there should be 10 instructions processed per cycle
- Only output register and log when stepping? (could slow down UI too much?)
- Move instructions in to their own module for testability
- Implement remaining instructions
- Unit tests like: https://github.com/mir3z/chip8-emu/blob/master/src/chip8-is.js
