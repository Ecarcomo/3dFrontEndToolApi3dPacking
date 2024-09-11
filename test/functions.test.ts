import { parserInfoItems,encontrarPos} from '../src/functions/utils.functions';

describe('parserInfoItems', () => {
    it('debería lanzar un error si los datos están vacíos', () => {
        expect(() => parserInfoItems("")).toThrow("Empty DataItems");
    });
  
    it('debería parsear correctamente un string de datos', () => {
        const data = "* sillon 2 cuerpos - 300x80x80 50kg(3.000x0.800x0.800, weight: 50.000) pos([0, 0, 0]) rt(0) vol(1.920)";
        const result = parserInfoItems(data);

        // Imprimir el valor de result en la consola
        console.log(result);

        expect(result.length).toBe(1);
        expect(result[0].name).toContain("sillon 2 cuerpos");
        expect(result[0].width).toBe(3.000);
        expect(result[0].height).toBe(0.800);
        expect(result[0].depth).toBe(0.800);
        expect(result[0].weight).toBe(50.000);
        expect(result[0].pX).toBe(0);
        expect(result[0].pY).toBe(0);
        expect(result[0].pZ).toBe(0);
        expect(result[0].rt).toBe(0);
    });
  });

describe('encontrarPos', () => {
    it('debería parsear correctamente un string de datos', () => {
        const data = "Decimal('0.300')";
        const result = encontrarPos(data,'(',1);

        // Imprimir el valor de result en la consola
        console.log(result);

        /*expect(result.length).toBe(1);
        expect(result[0].name).toContain("mesa de luz");
        expect(result[0].width).toBe(40.2);
        expect(result[0].height).toBe(50.5);
        expect(result[0].depth).toBe(2);
        expect(result[0].weight).toBe(2);
        expect(result[0].pX).toBe(2);
        expect(result[0].pY).toBe(2);
        expect(result[0].pZ).toBe(2);
        expect(result[0].rt).toBe(2);*/
    });
  });