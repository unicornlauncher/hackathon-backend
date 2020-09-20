class RoomCodeGenerator {
  static generate() {
    const alphabet = 'abcdefghijklmnopqrstuvxwyz';
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

    let code = '';
    for (let i = 0; i <= 4; i++) {
      code +=
        parseInt(Math.random() * 2) % 2 === 0
          ? alphabet[
              parseInt(Math.random() * 99999) % alphabet.length
            ].toUpperCase()
          : numbers[parseInt(Math.random() * 99999) % numbers.length];
    }

    return code;
  }
}

module.exports = { RoomCodeGenerator };
