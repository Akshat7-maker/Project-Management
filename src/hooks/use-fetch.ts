import { useState } from "react";


const useFetch = (cb: any) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const fn = async (...args: any) =>{
        setLoading(true);
        setError(null);

        try {
            const res = await cb(...args);
            // console.log("res", res);
            setData(res);
            return res;
            
        } catch (error: any) {
            setError(error);
            throw error;
            
        }finally{
            setLoading(false);
        }

    }

    return {
        loading,
        error,
        data,
        fn
    }
}

export default useFetch