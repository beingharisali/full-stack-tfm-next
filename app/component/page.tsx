import { Sidebar } from 'lucide-react'
import React from 'react'
import Nav from './Navbar'
import Dashboard from './dashboard'

function page() {
  return (
    <div>
        <Nav/>
      <Sidebar/>
      <Dashboard/>
    </div>
  )
}

export default page
