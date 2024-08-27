import { useEffect, useState } from "react";
import {axiosClient} from "../Helpers/axiosCLient";




export const useItems = () => {
    const [items , setItems] = useState({});
    const [loading , setLoading] = useState(true);
    const [error , setError] = useState(false);

    useEffect(() => {
        const postItems = async () => {

            axiosClient.post(`/api/pack`,{
                "baulera":{
                    "name":"baulera 3x3x3",
                    "width":3.0,
                    "height":3.0,
                    "depth":3.0,
                    "weightLimit":10000
                },
                "items":[
                    {"name": "sillon 2 cuerpos","width":3.0,"height":0.8,"depth":0.8,"weight":40},
                    {"name": "mesa de luz","width":0.4,"height":0.5,"depth":0.4,"weight":5},
                ]
            })
            .then((response) =>{
                setItems(response.data);
                setLoading(false);
                setError(false);
                console.log(response.data);
            })
            .catch((error) =>{
                setError(true);
                setLoading(false);
                setItems({});
                console.log(error);
            });
        };

        postItems();
        return () => {};
    },[]);

    return {
        items,
        loading,
        error
    };

}