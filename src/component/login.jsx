import React from 'react'

function login(){
    return (
        <>
        <form>
        <h1 class="class =text-3xl font-bold underline">Login</h1>
        <div>
            <label class="text-2xl  font-file">Enter your Email</label>
            <input class="text-2xl font-sans  " type="text" placeholder="enter your email"></input>
        </div>
        <div>
            <label>Enter your Password</label>
            <input type="text" placeholder="enter your password"></input>
        </div>
        <button class="hover border-2px-solid  bg-green ">Submit</button>
        </form>

        </>
    )
}
export default login