import { useState, useEffect } from 'react';
import api from '../api';

export const useSectionVisibility = (page = 'home') => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSections = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/sections/page/${page}`);
                setSections(response.data.sections || []);
                setError(null);
            } catch (err) {
                console.error('Error fetching section visibility:', err);
                setError(err);
                // Set default sections on error
                setSections([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSections();
    }, [page]);

    const isVisible = (sectionId) => {
        const section = sections.find(s => s.id === sectionId);
        return section ? section.isVisible : true; // Default to visible if not found
    };

    return { sections, isVisible, loading, error };
};

export default useSectionVisibility;
