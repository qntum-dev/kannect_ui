import { Metadata } from "next";
import RegisterForm from "../register-form";
export const metadata: Metadata = {
    title: 'Sign up for kannect',
    description: 'Create your account',
}

const page = () => {
    return (
        <div className="h-dvh flex items-center justify-center">
            <RegisterForm />

        </div>
    );
}

export default page;