import { useEffect, useRef, useState } from "react";
import {axiosClient} from "../Helpers/axiosCLient";
import "./Panel.css"
import Modal from 'react-modal';
<<<<<<< Updated upstream
import ThreeJSScene from './ThreeJSScene';
=======
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from "react-bootstrap/esm/ToggleButtonGroup";
import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table'
import Badge from "react-bootstrap/esm/Badge";
import FloatingLabel from "react-bootstrap/esm/FloatingLabel";
import Form from "react-bootstrap/esm/Form";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from "react-bootstrap/esm/Stack";
import { InfoItem, parserInfoItems } from "../functions/utils.functions";
import { Scene } from "../functions/render.functions";
import { createRoot } from "react-dom/client";

>>>>>>> Stashed changes

Modal.setAppElement('#root');

const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
  };

/**
 * @function Panel
 * @author @emmanuel_carcomo <emmanuelcarcomo@gmail.com> 
 * @description
 * @param {Object} scriptPath path to python executable 
 * @param {Object} data JSON data for python executable 
 * @returns  {Object}  Python response
 */
export default function Panel () {
   // const [items , setItems] = useState({});
    //const [loading , setLoading] = useState(true);
   // const [error , setError] = useState(false);

    const itemsSelectedTable = useRef<HTMLTableElement | null>(null);
    const itemsInput_w = useRef<HTMLInputElement | null>(null);
    const itemsInput_h = useRef<HTMLInputElement | null>(null);
    const itemsInput_d = useRef<HTMLInputElement | null>(null);
    const itemsInput_we = useRef<HTMLInputElement | null>(null);
    const itemsInput_name = useRef<HTMLInputElement | null>(null);
    const textAreaFitted = useRef<HTMLTextAreaElement | null>(null);
    const textAreaUnFitted = useRef<HTMLTextAreaElement | null>(null);
    

   interface Item {
    name: string;
    width: number;
    height: number;
    depth: number;
    weight: number;
    quantity: number;
  }

  interface ItemsPrev {
    name: string;
    width: number;
    height: number;
    depth: number;
    weight: number;
  }

  interface Baulera {
    value:number;
    name: string;
    width: number;
    height: number;
    depth: number;
    weightLimit: number;
  }

  const [itemsSelected, setItemsSelected] = useState<Item[]>([]);
  //const [indexItemSelected,setIndexItemSelected]= useState<number>(0);
<<<<<<< Updated upstream
  const [bauSelected, setBauSelected] = useState<Baulera>();
  const [modalIsOpen, setIsOpen] = useState(false);
  const [renderProps, setRenderProps] = useState({width: 1,
    height: 1,
    depth: 1,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },});
=======
>>>>>>> Stashed changes

  const [dataRender ,setDataRender] = useState<InfoItem[]>([]);

  const [modalIsOpen, setIsOpen] = useState(false);
  const [badgleColor,setBadgleColor] = useState<string>('primary');
  
   const bauleras = {
        "bauleras":[
            {"value":1,"name":"Baulera 60x300x300","width":0.6,"height":3.0,"depth":3.0, "weightLimit":1200},
            {"value":2,"name":"Baulera 100x300x300","width":1.0,"height":3.0,"depth":3.0, "weightLimit":2000},
            {"value":3,"name":"Baulera 500x300x300","width":5.0,"height":3.0,"depth":3.0, "weightLimit":10000}
        ]
   };
   const [bauSelected, setBauSelected] = useState<Baulera>(bauleras["bauleras"][0]);
   //instancio items predeterminados
   const [itemsPrev, setItemsPrev] = useState<ItemsPrev[]>([
    {"name": "sillon 2 cuerpos - 300x80x80 50kg","width":3.0,"height":0.8,"depth":0.8,"weight":50},
    {"name": "mesa de luz - 40x50x40 10kg","width":0.4,"height":0.5,"depth":0.4,"weight":10},
    {"name": "caja - 30x10x30 2kg","width":0.3,"height":0.1,"depth":0.3,"weight":2}
    ]);

    useEffect(()=>
    {
        return ()=>{
            const divRender = document.getElementById('divRender');
            if (divRender) {
                const root = createRoot(divRender);
                root.render(<Scene objsCoordenadas={dataRender} />);
            }
        }
        
    },dataRender);
    
    const openModal=() =>{
    setIsOpen(true);
    }
    
    const closeModal=() =>{
        setIsOpen(false);
    }
 
    const DropRowToList= async (name: string, index: number) =>{
        setItemsSelected(prevItems => prevItems.filter(item => item.name !== name));
        document.getElementById("sel-item_"+index)?.removeChild;
        console.log(itemsSelected);
    };


    const AddRowToList = async (name: string, w: number, h: number, d: number, we: number,_index: number) => {
        
        const qty = Number((document.getElementsByName("quantity-item")[_index] as HTMLInputElement).value);
        
        
        const newItem: Item = {
            name: name,
            width: w,
            height: h,
            depth: d,
            weight: we,
            quantity :qty
        };
        
        const existingItem = itemsSelected.find(item => (item.name === newItem.name &&
            item.width === newItem.width &&
            item.height === newItem.height &&
            item.depth === newItem.depth &&
            item.weight === newItem.weight)
        );

        if(existingItem){
            setItemsSelected(itemsSelected.map(item => 
                item.name === existingItem.name ? 
                { ...item, quantity: item.quantity + newItem.quantity } 
                : item)
            );
        }
        else{
            //setIndexItemSelected(prevIndex => prevIndex + 1);
            setItemsSelected((prevItems) => [...prevItems, newItem]);
        }
        
        console.log(itemsSelected);
    };
    
    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();

        if(itemsSelected.length==0){
            alert('No se ingresaron Items a la lista');
            return false;
        }
        
        const data = {
            "baulera":bauSelected,
            "items":itemsSelected
        };
        const config = {
            headers: {
              'Content-Type': 'application/json'
            }
          };
        try {
            const response = await axiosClient.post(`/api/pack/`,data,config);
            const badgle = document.getElementById("resultRef");
            console.log(response.data);
            if (badgle) {
                //Si el Array "unfittedItems" está vacio , entonces entraron todos los items
                if(response.data["unfittedItems"].length === 0){
                    setBadgleColor('success');
                    badgle.innerHTML = 'Entra todo';
                }else{
                    setBadgleColor('danger');
                    badgle.innerHTML = 'Quedaron cosas afuera';
                }
                
                if (textAreaFitted.current && textAreaUnFitted.current) {
                    let fit =response.data["fittedItems"].reduce((acc:string,item:any)=> acc +"* " +item["item"]+"\n\n","");
                    textAreaFitted.current.value = fit;
                    let unfit = response.data["unfittedItems"].reduce((acc:string,item:any)=> acc + "* " +item["item"]+"\n\n","");
                    textAreaUnFitted.current.value = unfit;
                }
            }
        } catch (error) {
            throw new Error('Error: ' +error);
        }
       
    };

    function AddItem (){
        const name_i = itemsInput_name.current?.value;
        const w_i = itemsInput_w.current?.value;
        const h_i = itemsInput_h.current?.value;
        const d_i = itemsInput_d.current?.value;
        const we_i = itemsInput_we.current?.value;

        const item_name = name_i+" - "+w_i+"x"+h_i+"x"+d_i+" "+we_i+"kg";

        const newItem : ItemsPrev= {
            name: item_name,
            width:  Number(w_i)/100,
            height: Number(h_i)/100,
            depth: Number(d_i)/100,
            weight: Number(we_i)/100
        };

        setItemsPrev((prevItems) => [...prevItems, newItem]);
        console.log(itemsPrev);
        closeModal();
    }

    const dropItemPrev =(index:number,name :string) =>{
        setItemsPrev(prevItems => prevItems.filter(item => item.name !== name));
        document.getElementById("li-item-"+index)?.removeChild;
        console.log(itemsPrev);
    }
    
const handleRenderRequest = async () => {
    try {
      const response = {
        data: {
          width: 2,
          height: 2,
          depth: 2,
          position: { x: 1, y: 1, z: 1 },
          rotation: { x: 0.5, y: 0.5, z: 0 },
        }
      };
  
      setRenderProps(response.data);
    } catch (error) {
      console.error('Error in POST request', error);
    }
  };

    const handleRender3d = () => {
        if(textAreaFitted.current){
            let objsCoordenadas = parserInfoItems(textAreaFitted.current.value);
            console.log(objsCoordenadas);
            setDataRender(objsCoordenadas);
        }
    }

    return (
        <>
        <Container id="container">
            <form  onSubmit={handleSubmit}>
                <Row id="panel-items">
                    <Col xs={12} md={6} lg={6}>
                        <div>
                            <center><h3><Badge bg="secondary">Medidas en CMs (Ancho ,alto ,profundo)</Badge></h3>
                                <br />
                                Seleccionar una baulera
                                <br />
                                <ToggleButtonGroup name="bau-opciones" type="radio" vertical={false}>
                                    {bauleras["bauleras"].map((opcion, idx) => (
                                        <ToggleButton
                                            key={idx}
                                            id={`radio-${idx}`}
                                            type="radio"
                                            variant="dark"
                                            name="radio"
                                            value={opcion.value}
                                            checked={bauSelected.value === idx}
                                            onChange={() => setBauSelected( bauleras["bauleras"][idx])}
                                        >
                                            {opcion.name}
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>
                            </center>
                        </div>
                        <br />
                        <div id="li-items-prev">
                            <Table variant="dark">
                                {
                                        itemsPrev.map((item,index)=>(
                                            <>
                                                <tr id={"li-item-"+index}>
                                                    <td>
                                                        <Button type="button" variant="danger" onClick={()=>dropItemPrev(index,item["name"])}> X </Button>
                                                    </td>
                                                    <td>
                                                        {item["name"]}
                                                    </td>
                                                    <td>
                                                        <input type="text" size={3} name={"quantity-item"} defaultValue={"1"}/>
                                                        <Button id={"btn-item-"+index} type="button" onClick={()=>AddRowToList(item["name"],item["width"],item["height"],item["depth"],item["weight"],index)} >
                                                        +
                                                        </Button> 
                                                    </td>  
                                                </tr>
                                            </>
                                        ))
                                }
                            </Table>
                        </div>
                        <div style={{textAlign:"center"}}>
                            <Button variant="warning" type="button" onClick={openModal}>Nuevo Item</Button>
                        </div>
                    </Col>
                    <Col xs={12} md={6} lg={6} id="container-table">
                        <Table  variant="dark" striped bordered hover  ref={itemsSelectedTable} >
                            <thead><tr>
                                <th style={{width:"30%"}}>Descrip.</th>
                                <th>Ancho (Mts)</th>
                                <th>Alto (Mts)</th>
                                <th>Profundo (Mts)</th>
                                <th>Peso(KG)</th>
                                <th>Cant.</th>
                                <th></th>
                            </tr></thead>
                            <tbody>
                            {
                                    itemsSelected.map((item,index)=>(
                                        <tr id={"sel-item_"+index} >
                                            <td>{item.name}</td>
                                            <td>{item.width}</td>
                                            <td>{item.height}</td>
                                            <td>{item.depth}</td>
                                            <td>{item.weight}</td>
                                            <td>{item.quantity}</td>
                                            <td>
                                                <Button variant="danger" onClick={() => DropRowToList(item.name,index)} >X</Button>
                                            </td>
                                          </tr>
                                    ))
                            }
<<<<<<< Updated upstream
                        </table>
                    </div>
                </div>
                <div id="panel-res">
                    <table>
                        <tr>
                            <td>
                                <button type="submit" >Calcular Espacio</button>
                            </td>
                            <td>
                                <input type="text" id="result" ref={resultRef} placeholder="Se visualizará el resultado aquí" readOnly/>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="res_box">
                                    <label htmlFor="">Items que entran en la baulera</label>
                                    <textarea cols={30} rows={10} ref={textAreaFitted} />
                                </div>
                                
                                <div className="res_box">
                                    <label htmlFor="">Items que NO entran en la baulera</label>
                                    <textarea  cols={30} rows={10} ref={textAreaUnFitted}/>
                                </div>
                            </td>
                            <td className="div_box">
                                <button type="button" onClick={handleRenderRequest} >Renderizar 3D</button>
                                <iframe src="">
                                <ThreeJSScene cubeProps={renderProps} />
                                </iframe>
                            </td>
                        </tr>
                    </table> 
                </div>
=======
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                <hr />
                <Row id="panel-res">
                    <Col xs={12} md={6} lg={6}>
                        <Stack direction="horizontal" gap={5}>  
                            <Button variant="light" type="submit" >Calcular Espacio</Button>
                            <Badge bg={badgleColor} id="resultRef"> Se visualizará el resultado aquí </Badge>
                        </Stack>
                        <br />
                        
                        <FloatingLabel controlId="floatingTextarea2" label="Items que entran en la baulera">
                            <Form.Control
                            as="textarea"
                            placeholder="Leave a comment here"
                            style={{ height: '250px' ,color:'white'}}
                            ref={textAreaFitted}
                            readOnly
                            />
                        </FloatingLabel>
                            <br />
                        <FloatingLabel controlId="floatingTextarea2" label="Items que NO entran en la baulera">
                            <Form.Control
                            as="textarea"
                            placeholder="Leave a comment here"
                            style={{ height: '250px' ,color:'white'}}
                            ref={textAreaUnFitted}
                            readOnly
                            />
                        </FloatingLabel>
                    </Col>
                    <Col xs={12} md={6} lg={6}>
                        <Button variant="warning" onClick={()=> handleRender3d()}>Renderizar 3D</Button>
                        <br />
                        <div id="divRender"></div>
                    </Col>
                </Row>
>>>>>>> Stashed changes
            </form>
        </Container>
        <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <button onClick={closeModal}>close</button>
        
        <form className="form_i">
            <table>
                <tr><th colSpan={3}>
                    <h3>Crea un nuevo item a agregar</h3>
                    <h6>Medidas en Centimetros</h6>
                </th></tr>
                <tr>
                    <td>
                        <label htmlFor="">Nombre: </label>
                    </td>
                    <td colSpan={2}>
                        <input ref={itemsInput_name} type="text" size={30} placeholder="Cajonera chica" name="nombre_i"/>
                    </td>
                </tr>
                <tr>
                    <td>
                        <label htmlFor="">Ancho: </label>
                    </td>
                    <td>
                        <input ref={itemsInput_w} type="number" className="input_i_num"  min={0} defaultValue={0} name="width_i"/>
                    </td>
                    <td>
                        <span> CMs</span>
                    </td>
                </tr>
                <tr>
                    <td>
                        <label htmlFor="">Alto: </label>
                    </td>
                    <td>
                        <input ref={itemsInput_h} type="number" className="input_i_num"  min={0}  defaultValue={0} name="height_i"/>
                    </td>
                    <td>
                        <span> CMs</span>
                    </td>
                </tr>
                <tr>
                    <td>
                        <label htmlFor="">Profundo: </label>
                    </td>
                    <td>
                        <input ref={itemsInput_d} type="number" className="input_i_num"  min={0}  defaultValue={0} name="depth_i"/>
                    </td>
                    <td>
                        <span> CMs</span>
                    </td>
                </tr>
                <tr>
                    <td>
                        <label htmlFor="">Peso: </label>
                    </td>
                    <td>
                        <input ref={itemsInput_we} type="number" className="input_i_num"  min={0}  defaultValue={0} name="weight_i"/>
                    </td>
                    <td>
                        <span> kGs</span>
                    </td>
                </tr>
            </table>
            <button onClick={()=>AddItem()}>Agregar</button>
        </form>
      </Modal>
        </>
    );
    
}


