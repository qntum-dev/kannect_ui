import { Metadata } from "next";
import VerifyPage from "../send-verification-page";
export const metadata: Metadata = {
    title: 'Verify your account',
    description: 'Verify your account on kannect',
}
const page = () => {
    return (
        <VerifyPage />
    );
}

export default page;