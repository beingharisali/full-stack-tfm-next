import Image from "next/image";
import Nav from "./component/Navbar";
import  Sidebar  from "./component/sidebar"
import Dashboard from "./component/dashboard";

export default function Home() {
  return (
    <div>
      <Nav/>
      <Sidebar/>
      {/* <Dashboard/> */}
    </div>
  );
}
