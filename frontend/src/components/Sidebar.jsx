import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Box, VStack, Heading, Button, Text } from '@chakra-ui/react';
import { useAuth } from '@/context/AuthContext';

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeLinkStyle = {
    backgroundColor: 'teal.600',
    color: 'white',
    borderRadius: '6px',
    display: 'block',
    padding: '10px'
  };

  const defaultLinkStyle = {
    padding: '10px',
    borderRadius: '6px',
    display: 'block'
  }

  return (
    <Box as="nav" w="250px" bg="gray.800" color="white" h="100vh" p="5" position="fixed" display="flex" flexDirection="column">
        <Heading as="h1" size="lg" textAlign="center" mb={10}>FitSync Pro</Heading>
        <VStack align="stretch" spacing={4}>
            <NavLink to="/dashboard" style={({ isActive }) => isActive ? activeLinkStyle : defaultLinkStyle}>User Dashboard</NavLink>
            {user?.role === 'coach' && (
                <NavLink to="/coach-dashboard" style={({ isActive }) => isActive ? activeLinkStyle : defaultLinkStyle}>Coach Dashboard</NavLink>
            )}
            <NavLink to="/profile" style={({ isActive }) => isActive ? activeLinkStyle : defaultLinkStyle}>My Profile</NavLink>
        </VStack>
        <Box mt="auto">
            <Text mb={2}>Logged in as:</Text>
            <Text fontWeight="bold" noOfLines={1}>{user?.email}</Text>
            <Button colorScheme="red" onClick={handleLogout} w="100%" mt={4}>Logout</Button>
        </Box>
    </Box>
  );
}
export default Sidebar;