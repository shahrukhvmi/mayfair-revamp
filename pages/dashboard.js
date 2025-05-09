import DashBoardLayout from '@/Components/Dashboard/DashboardLayout/DashBoardLayout'
import MyAccount from '@/Components/Dashboard/MyAccount/MyAccount'
import React from 'react'


const dashboard = () => {
    return (
        <>
            <DashBoardLayout>
                <MyAccount />
            </DashBoardLayout>

        </>
    )
}

export default dashboard