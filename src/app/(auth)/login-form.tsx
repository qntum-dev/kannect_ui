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
import { loginAction } from "../actions/auth-actions"
import { } from "next/navigation"
import { useRouter } from "next/navigation"
import { loginSchema, LoginSchemaType } from "@/lib/types"
import { useAuthStore } from "@/components/stores/auth-store"

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [isPending, startTransition] = useTransition() // Add transition state
    const login = useAuthStore((state) => state.login);

    const router = useRouter(); // Use router for navigation

    const form = useForm<LoginSchemaType>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })



    const onSubmit = async (values: LoginSchemaType) => {
        startTransition(async () => {
            const result = await loginAction(values)

            if (result.error) {
                console.log("Error:", result.error)

                form.setError("root", {
                    message: result.error,
                })
            } else {
                console.log("Success:", result.data)
                const user = result.data?.userData;
                if (user) {
                    login({ user }); // store in Zustand
                    router.push("/");
                } else {
                    form.setError("root", {
                        message: "Login failed: Invalid server response",
                    });
                }
            }
        })
    }

    return (
        <div className="w-full max-w-sm">
            <Form {...form}>
                <form className="flex flex-col gap-6  p-4 rounded-md bg-secondary" onSubmit={form.handleSubmit(onSubmit)}>
                    <h2 className="text-xl font-bold text-center">
                        Log in to Your Account
                    </h2>

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter your email address"
                                        {...field}
                                        required
                                        autoComplete="email"
                                        disabled={isPending}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            placeholder="Enter your password"
                                            {...field}
                                            required
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="current-password"
                                            disabled={isPending}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                            disabled={isPending}
                                        >
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

                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-800 cursor-pointer text-white text-base"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Logging in...
                            </>
                        ) : (
                            "Log in"
                        )}
                    </Button>

                    <hr className="border-t border-gray-400 w-full" />
                    <div className="text-center">
                        <span>Don&apos;t have an account? </span>
                        <a href="/register" className="text-blue-400 hover:text-blue-600" tabIndex={isPending ? -1 : 0}>
                            Sign Up
                        </a>
                    </div>
                </form>
            </Form>
        </div>
    )
}