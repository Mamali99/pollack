// import React from 'react';
// import { Navbar, Nav } from 'react-bootstrap';
// import { Link } from 'react-router-dom';

// function Header() {
//   return (
//     <Navbar bg="light" expand="lg">
//       <Navbar.Toggle aria-controls="basic-navbar-nav" />
//       <Navbar.Collapse id="basic-navbar-nav">
//         <Nav className="mr-auto">
//           <Nav.Link as={Link} to="/">Home</Nav.Link>
//           <Nav.Link as={Link} to="/vote">Vote</Nav.Link>
//           <Nav.Link as={Link} to="/poll">Poll</Nav.Link>
//         </Nav>
//       </Navbar.Collapse>
//     </Navbar>
//   );
// }

// export default Header;
import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
      <Navbar.Brand as={Link} to="/">Pollack</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          <Nav.Link as={Link} to="/">Home</Nav.Link>
          <Nav.Link as={Link} to="/vote">Vote</Nav.Link>
          <Nav.Link as={Link} to="/poll">Poll</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Header;
