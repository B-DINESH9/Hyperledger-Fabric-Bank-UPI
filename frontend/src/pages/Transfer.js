// Importing necessary libraries and components
import React, { useEffect, useState } from 'react';

// import { FaTimes } from 'react-icons/fa'; // Removed unused import

function Transfer() {
    const [challenge, setChallenge] = useState(null);
    const [resp, setResp] = useState(null);

    useEffect(() => {
        // Assume this fetches a challenge
        const fetchChallenge = async () => {
            const result = await fetch('/api/challenge');
            const data = await result.json();
            setResp(data); // Ensure resp variable is used
            setChallenge(data.challenge);
        };

        fetchChallenge();
    }, []);

    return <div>{challenge}</div>;
}

export default Transfer;