

export interface InfoItem {
    name: string;
    width: number;
    height: number;
    depth: number;
    weight: number;
    pX: number;
    pY: number;
    pZ: number;
    rt: number;
  }

export function parserInfoItems(data:string): InfoItem[]{
    let InfoItems:InfoItem[] = [];
    let _item:InfoItem ;
    if (data.length == 0) {
      throw new Error("Empty DataItems");
    }

    

    data.split('\n\n').map((item)=>{
      if(!item.indexOf("*")){
        console.log(item);
        let _pX = item.substring(encontrarPos(item,'pos([',1)+5  , encontrarPos(item,',',2)).trim();
        let _pY = item.substring(encontrarPos(item,',',2)+1  , encontrarPos(item,',',3)).trim();
        let _pZ = item.substring(encontrarPos(item,',',3)+1  , encontrarPos(item,'])',1)).trim();
        

        _item= {
          name : item.substring(encontrarPos(item,'*',1)+1  , encontrarPos(item,'(',1)).trim(),
          width: Number(item.substring(encontrarPos(item,'(',1)+1  , encontrarPos(item,'x',3)).trim()),
          height: Number(item.substring(encontrarPos(item,'x',3)+1  , encontrarPos(item,'x',4)).trim()),
          depth: Number(item.substring(encontrarPos(item,'x',4)+1  , encontrarPos(item,',',1)).trim()),
          weight: Number(item.substring(encontrarPos(item,':',1)+1  , encontrarPos(item,')',1)).trim()),
          pX: Number(deleteDecimalText(_pX)),
          pY: Number(deleteDecimalText(_pY)),
          pZ: Number(deleteDecimalText(_pZ)),
          rt: Number(item.substring(encontrarPos(item,'rt(',1)+3  , item.indexOf(')',encontrarPos(item,'rt(',1)) ).trim())
        };

        InfoItems.push(_item);
      }
    });

    return InfoItems;
}

function deleteDecimalText(data:string):string{
  let result:string = data;
  
  if(!data.indexOf("Decimal"))
  {
    result = data.substring(encontrarPos(data,'(',1)+2 ,encontrarPos(data,')',1)-1);
  }
  
  return result;
}




export function encontrarPos(cadena: string, caracter: string, ocurrencia: number): number {
  let posiciones: number[] = [];
  let posicion = cadena.indexOf(caracter);

  
  while (posicion !== -1) {
    posiciones.push(posicion);
    posicion = cadena.indexOf(caracter, posicion + 1);
  }

  if (ocurrencia < 1 || ocurrencia > posiciones.length) {
    throw new Error("Ocurrencia fuera de rango");
  }

  return posiciones[ocurrencia - 1];
}

