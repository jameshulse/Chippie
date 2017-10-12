let context = new AudioContext();

export default (time) => {
    let oscillator = context.createOscillator();
    
    oscillator.frequency.value = 1500;
    oscillator.type = 'sine';
    
    oscillator.connect(context.destination);
    oscillator.start();

    setTimeout(() => oscillator.stop(), time || 100);
}