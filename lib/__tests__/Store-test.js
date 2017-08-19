const assert = require('assert');

const Store = require('../Store');


describe('lib/Store', function() {
  describe('Static methods', function() {
    describe('_convertFallingPuyoToSquares', function() {
      it('can be executed correctly', function() {
        // +------+
        // |  Y   |
        // |  R   |
        assert.deepEqual(
          Store._convertFallingPuyoToSquares({rowIndex: 1, columnIndex: 2}, ['RED', 'YELLOW'], 'UP'),
          [
            {
              rowIndex: 1,
              columnIndex: 2,
              colorType: 'RED',
            },
            {
              rowIndex: 0,
              columnIndex: 2,
              colorType: 'YELLOW',
            },
          ]
        );

        // +------+
        // |BG    |
        assert.deepEqual(
          Store._convertFallingPuyoToSquares({rowIndex: 0, columnIndex: 0}, ['BLUE', 'GREEN'], 'RIGHT'),
          [
            {
              rowIndex: 0,
              columnIndex: 0,
              colorType: 'BLUE',
            },
            {
              rowIndex: 0,
              columnIndex: 1,
              colorType: 'GREEN',
            },
          ]
        );

        // +------+
        // |     R|
        // |     Y|
        assert.deepEqual(
          Store._convertFallingPuyoToSquares({rowIndex: 0, columnIndex: 5}, ['RED', 'YELLOW'], 'DOWN'),
          [
            {
              rowIndex: 0,
              columnIndex: 5,
              colorType: 'RED',
            },
            {
              rowIndex: 1,
              columnIndex: 5,
              colorType: 'YELLOW',
            },
          ]
        );

        // +------+
        // |      |
        // |    YR|
        assert.deepEqual(
          Store._convertFallingPuyoToSquares({rowIndex: 1, columnIndex: 5}, ['RED', 'YELLOW'], 'LEFT'),
          [
            {
              rowIndex: 1,
              columnIndex: 5,
              colorType: 'RED',
            },
            {
              rowIndex: 1,
              columnIndex: 4,
              colorType: 'YELLOW',
            },
          ]
        );
      });

      it('can return negative coordinates', function() {
        // +--Y---+
        // |  R   |
        assert.deepEqual(
          Store._convertFallingPuyoToSquares({rowIndex: 0, columnIndex: 2}, ['RED', 'YELLOW'], 'UP'),
          [
            {
              rowIndex: 0,
              columnIndex: 2,
              colorType: 'RED',
            },
            {
              rowIndex: -1,
              columnIndex: 2,
              colorType: 'YELLOW',
            },
          ]
        );

        // +------+
        // |      |
        // GB     |
        assert.deepEqual(
          Store._convertFallingPuyoToSquares({rowIndex: 1, columnIndex: 0}, ['BLUE', 'GREEN'], 'LEFT'),
          [
            {
              rowIndex: 1,
              columnIndex: 0,
              colorType: 'BLUE',
            },
            {
              rowIndex: 1,
              columnIndex: -1,
              colorType: 'GREEN',
            },
          ]
        );
      });
    });
  });
});
