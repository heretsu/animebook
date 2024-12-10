import supabase from "./authenticateUser";

export default function KiStore(){
    const fetchKiInteractors = () => {
        supabase
          .from("kiposts")
          .select()
          .then((res) => {
            console.log(res)
            if (res.data !== undefined && res.data !== null) {
              
            }
          });
      };
}