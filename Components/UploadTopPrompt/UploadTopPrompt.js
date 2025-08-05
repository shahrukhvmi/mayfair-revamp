import Link from 'next/link'
import React from 'react'

const UploadTopPrompt = () => {
    return (
        <>

            <div className="bg-gray-100">
                <div className="bg-violet-400 text-white text-center p-2 flex flex-col sm:flex-row justify-center items-center gap-2 text-sm sm:text-base reg-font">
                    <div className="flex items-center gap-2">
                        <svg
                            stroke="currentColor"
                            fill="currentColor"
                            strokeWidth="0"
                            viewBox="0 0 24 24"
                            className="text-xl"
                            height="1em"
                            width="1em"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path fill="none" d="M0 0h24v24H0z"></path>
                            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H8v-1.5c0-1.99 4-3 6-3s6 1.01 6 3V16z"></path>
                        </svg>
                        <span className='text-sm'>Image required to proceed.  <Link href="/photo-upload" className='text-blue-900 underline'>Click here to upload</Link></span>
                    </div>

                </div>
            </div>
        </>
    )
}

export default UploadTopPrompt
/* 
 <header className="bg-violet-400 relative top-0 left-0 w-full h-8 flex items-center justify-center z-50 p-4">
                <div className="flex justify-center">
                    <p className='text-sm'>
                        If you don’t upload your image, you won’t be able to proceed.{" "}
                        <Link href="/photo-upload" className='text-blue-900 underline'>Click here to upload</Link>
                    </p>
                </div>
            </header>

*/ 