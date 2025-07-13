import React from 'react'

function SignedInLayout({children}:{children: React.ReactNode}) {
  return (

    <div className='flex justify-center items-center'>
        {children}
    </div>
    
  )
}

export default SignedInLayout