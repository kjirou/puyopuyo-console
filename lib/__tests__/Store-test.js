const assert = require('assert');

const Store = require('../Store');
const {PUYOPUYO_COLOR_TYPES} = require('../constants');


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

    describe('_findMatchedSquaresSets', function() {
      const createMatrixFromText = (mapText) => {
        const symbols = mapText
          .split('\n')
          .map(line => line.split(''));
        const matrix = Store._generatePuyopuyoFieldSquareMatrix(symbols.length, symbols[0].length);

        matrix.forEach((rowSquares, rowIndex) => {
          rowSquares.forEach((square, columnIndex) => {
            square.colorType = {
              R: PUYOPUYO_COLOR_TYPES.RED,
              B: PUYOPUYO_COLOR_TYPES.BLUE,
              G: PUYOPUYO_COLOR_TYPES.GREEN,
              Y: PUYOPUYO_COLOR_TYPES.YELLOW,
              ' ': PUYOPUYO_COLOR_TYPES.NONE,
            }[symbols[rowIndex][columnIndex]];
          });
        });

        return matrix;
      };

      it('should not find short match', function() {
        const matrix = createMatrixFromText(
          [
            'RBGYYY',
            'RBGBBB',
            'RBGRRR',
          ].join('\n')
        );
        const sets = Store._findMatchedSquaresSets(matrix);

        assert.strictEqual(sets.length, 0);
      });

      it('should find a long match', function() {
        const matrix = createMatrixFromText(
          [
            '  YYY',
            '  Y  ',
            'YYY  ',
          ].join('\n')
        );
        const sets = Store._findMatchedSquaresSets(matrix);

        assert.strictEqual(sets[0][0].colorType, 'YELLOW');
        assert.strictEqual(sets[0][0].rowIndex, 0);
        assert.strictEqual(sets[0][0].columnIndex, 2);

        assert.strictEqual(sets[0][1].colorType, 'YELLOW');
        assert.strictEqual(sets[0][1].rowIndex, 0);
        assert.strictEqual(sets[0][1].columnIndex, 3);

        assert.strictEqual(sets[0][2].colorType, 'YELLOW');
        assert.strictEqual(sets[0][2].rowIndex, 0);
        assert.strictEqual(sets[0][2].columnIndex, 4);

        assert.strictEqual(sets[0][3].colorType, 'YELLOW');
        assert.strictEqual(sets[0][3].rowIndex, 1);
        assert.strictEqual(sets[0][3].columnIndex, 2);

        assert.strictEqual(sets[0][4].colorType, 'YELLOW');
        assert.strictEqual(sets[0][4].rowIndex, 2);
        assert.strictEqual(sets[0][4].columnIndex, 0);

        assert.strictEqual(sets[0][5].colorType, 'YELLOW');
        assert.strictEqual(sets[0][5].rowIndex, 2);
        assert.strictEqual(sets[0][5].columnIndex, 1);

        assert.strictEqual(sets[0][6].colorType, 'YELLOW');
        assert.strictEqual(sets[0][6].rowIndex, 2);
        assert.strictEqual(sets[0][6].columnIndex, 2);
      });

      it('should find multiple another color matches', function() {
        const matrix = createMatrixFromText(
          [
            ' Y B  ',
            ' Y BB ',
            'YY B  ',
          ].join('\n')
        );
        const sets = Store._findMatchedSquaresSets(matrix);

        assert.strictEqual(sets[0][0].colorType, 'YELLOW');
        assert.strictEqual(sets[0][0].rowIndex, 0);
        assert.strictEqual(sets[0][0].columnIndex, 1);

        assert.strictEqual(sets[0][1].colorType, 'YELLOW');
        assert.strictEqual(sets[0][1].rowIndex, 1);
        assert.strictEqual(sets[0][1].columnIndex, 1);

        assert.strictEqual(sets[0][2].colorType, 'YELLOW');
        assert.strictEqual(sets[0][2].rowIndex, 2);
        assert.strictEqual(sets[0][2].columnIndex, 0);

        assert.strictEqual(sets[0][3].colorType, 'YELLOW');
        assert.strictEqual(sets[0][3].rowIndex, 2);
        assert.strictEqual(sets[0][3].columnIndex, 1);

        assert.strictEqual(sets[1][0].colorType, 'BLUE');
        assert.strictEqual(sets[1][0].rowIndex, 0);
        assert.strictEqual(sets[1][0].columnIndex, 3);

        assert.strictEqual(sets[1][1].colorType, 'BLUE');
        assert.strictEqual(sets[1][1].rowIndex, 1);
        assert.strictEqual(sets[1][1].columnIndex, 3);

        assert.strictEqual(sets[1][2].colorType, 'BLUE');
        assert.strictEqual(sets[1][2].rowIndex, 1);
        assert.strictEqual(sets[1][2].columnIndex, 4);

        assert.strictEqual(sets[1][3].colorType, 'BLUE');
        assert.strictEqual(sets[1][3].rowIndex, 2);
        assert.strictEqual(sets[1][3].columnIndex, 3);
      });
    });
  });
});
