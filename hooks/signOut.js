import supabase from "./authenticateUser";
export default function SignOut() {

    const logOut = async() => {
        const { error } = await supabase.auth.signOut()
        return error;
    }
    return {logOut};
}