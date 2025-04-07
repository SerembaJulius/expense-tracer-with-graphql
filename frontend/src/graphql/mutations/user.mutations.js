import { gql } from "@apollo/client";
//signup mutation logic it should look like that from the backend
export const SIGN_UP = gql`
    mutation SignUp($input:SignUpInput!){
        SignUp(input: $input){
            _id
            name
            username
        }
    }

`

export const LOGIN= gql`
    mutation Login($input:LoginInput){
        login(input:$input){
            _id
            name
            username
        }
    }
`

export const LOGOUT =gql`

    mutation Logout{
        Logout{
            message
        }
    }
    
`