import { useCallback, useState } from "react";
import './App.css'
import Navigation from './components/Navigation/Navigation'
import Logo from './components/Logo/Logo'
import Rank from './components/Rank/Rank'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import SignIn from './components/SignIn/SignIn'
import SignUp from './components/SignUp/SignUp'
import Particles from 'react-tsparticles'
import { loadSlim } from 'tsparticles-slim'
import { detectFaces } from './lib/faceDetector'

const API_URL = 'https://peaceful-reef-16481-bb62933f00ed.herokuapp.com';

const initialState = {
  id: '',
  name: '',
  email: '',
  entries: 0,
  joined: ''
};


function App() {
  const [user, setUser] = useState(initialState);
  const [imageUrl, setImageUrl] = useState("");
  const [boxes, setBoxes] = useState([]);
  const [message, setMessage] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [route, setRoute] = useState('signin');

  const loadUser = (data) => {
    setUser({
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    });
  };

  const particlesInit = useCallback(async (engine) => {
    console.log(engine);
    // load the slim version of tsparticles
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    console.log(container);
  }, []);

  const particlesOptions = {
    fpsLimit: 60,
    interactivity: {
      events: {
        onClick: { enable: true, mode: "push" },
        onHover: { enable: true, mode: "repulse" },
        resize: true,
      },
      modes: {
        push: { quantity: 4 },
        repulse: { distance: 200, duration: 0.3 },
      },
    },
    particles: {
      color: { value: "#db2a4d" },
      links: { color: "#a91d3a", distance: 130, enable: true, opacity: 0.4, width: 1 },
      collisions: { enable: true },
      move: { direction: "none", enable: true, outMode: "out", random: false, speed: 2, straight: true },
      number: { density: { enable: true, value_area: 800 }, value: 200 },
      opacity: { value: 0.4 },
      shape: { type: "circle" },
      size: { random: true, value: 5 },
    },
    detectRetina: true,
  };

  const onFileChange = (event) => {
    const file = event.target.files[0];
    if (imageUrl) URL.revokeObjectURL(imageUrl); // free the previous photo
    setImageUrl(file ? URL.createObjectURL(file) : "");
    setBoxes([]);
    setMessage("");
  };

  const onSubmit = async () => {
    const image = document.getElementById('inputimage');
    if (!image) {
      setMessage('Choose a photo first.');
      return;
    }
    setIsDetecting(true);
    setMessage("");
    try {
      if (!image.complete) await image.decode();
      const faces = await detectFaces(image);
      setBoxes(faces);
      if (faces.length === 0) {
        setMessage('No faces found. Try another photo.');
        return;
      }

      // Count this detection on the server
      const response = await fetch(`${API_URL}/image`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id })
      });
      const count = await response.json();
      setUser(prevUser => ({ ...prevUser, entries: count }));
    } catch (error) {
      console.log('Error detecting faces:', error);
      setMessage('Something went wrong. Please try again.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleRouteChange = (route) => {
  if (route === 'signout') {
    setUser(initialState); // Reset user state when signing out
    setImageUrl(""); // Clear image URL
    setBoxes([]); // Clear face detection boxes
    setMessage("");
    setRoute('signin');   // Redirect to signin page
  } else {
    setRoute(route);      // Set route for other pages
  }
};

  return (
    <>
      <Particles className='particles'
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={particlesOptions}
      />
      <Navigation onRouteChange={handleRouteChange} route={route} />
      {
        route === 'home' ? (
          <><div>
            <Logo />
            <Rank name={user.name} entries={user.entries} />
            <ImageLinkForm onFileChange={onFileChange} onSubmit={onSubmit} isDetecting={isDetecting} />
            <FaceRecognition imageUrl={imageUrl} boxes={boxes} message={message} />
          </div>
          </>  // Pass setRoute as onRouteChange prop
        )
        : route === 'signin' ? (
          <SignIn loadUser={loadUser} onRouteChange={handleRouteChange} />
        )  // Pass setRoute as onRouteChange prop
          : (<SignUp loadUser={loadUser} onRouteChange={handleRouteChange} />  // Pass setRoute as onRouteChange prop
        ) 
      }
    </>
  )
}

export default App
