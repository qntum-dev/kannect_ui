"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState, useTransition } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { useRouter } from "next/navigation"
import { registerSchema, RegisterSchemaType } from "@/lib/types"
import { registerAction } from "../actions/auth-actions"
import { useAuthStore } from "@/components/stores/auth-store"





export default function RegisterForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [isPending, startTransition] = useTransition();
    const login = useAuthStore((state) => state.login);

    const router = useRouter(); // Use router for navigation

    const form = useForm<RegisterSchemaType>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            name: "",
            password: ""
        }
    })

    const onSubmit = async (values: RegisterSchemaType) => {
        startTransition(async () => {
            const result = await registerAction(values)

            if (result.error) {
                console.log("Error:", result.error)

                form.setError("root", {
                    message: result.error,
                })
            } else {
                // You could redirect, show toast, etc.
                const user = result.data?.userData;
                if (user) {
                    login({ user }); // store in Zustand
                    router.push("/verify"); // Use router.push instead of redirect

                } else {
                    form.setError("root", {
                        message: "Login failed: Invalid server response",
                    });
                }
            }
        })

    }
    return (
        <div className="w-full max-w-sm ">
            <Form {...form}>
                <form className="flex flex-col gap-6 border border-black p-4 rounded-md" onSubmit={form.handleSubmit(onSubmit)}>
                    <h2 className="text-xl font-bold text-center">
                        Create Your Account
                    </h2>
                    <FormField
                        control={form.control}
                        name="name"
                        disabled={isPending}

                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter name e.g. John Doe" {...field} required autoComplete="name" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        disabled={isPending}

                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your email address" {...field} required autoComplete="email" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        disabled={isPending}

                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <div className="relative">

                                        <Input placeholder="Enter your password" {...field} required type={showPassword ? "text" : "password"} autoComplete="current-password" />
                                        <button type="button" onClick={() => {
                                            setShowPassword((prev) => !prev)
                                        }} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {form.formState.errors.root && (
                        <div className="text-red-500 text-sm">
                            {form.formState.errors.root.message}
                        </div>
                    )}
                    <Button type="submit" className="w-full bg-blue-600 cursor-pointer" disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            "Signup"
                        )}
                    </Button>

                    <hr className="border-t border-gray-400 w-full" />
                    <div className="text-center">
                        Already have an account? {" "}
                        <a href="/login" className="text-blue-600">

                            Login
                        </a>
                    </div>
                </form>
            </Form>
        </div>
    )

}