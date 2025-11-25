
import React, { useState, useEffect, useCallback } from 'react';
import { Email } from './types';
import { generateRealisticEmail } from './services/geminiService';
import EmailDisplay from './components/EmailDisplay';
import InboxPanel from './components/InboxPanel';
import Header from './components/Header';
import Notification from './components/Notification';

const App: React.FC = () => {
    const [currentEmail, setCurrentEmail] = useState<string>('');
    const [emails, setEmails] = useState<Email[]>([]);
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [notification, setNotification] = useState<string | null>(null);

    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const generateNewAddress = useCallback(() => {
        const randomString = Math.random().toString(36).substring(2, 12);
        const domain = 'mailbox.alt.com';
        const newAddress = `${randomString}@${domain}`;
        setCurrentEmail(newAddress);
        setEmails([]);
        setSelectedEmail(null);
        showNotification("New email address generated!");
    }, []);

    const fetchNewEmail = useCallback(async () => {
        setIsLoading(true);
        try {
            const newEmailContent = await generateRealisticEmail();
            const newEmail: Email = {
                id: Math.random().toString(36).substring(2),
                ...newEmailContent,
                timestamp: new Date(),
                read: false,
            };
            setEmails(prevEmails => [newEmail, ...prevEmails]);
        } catch (error) {
            console.error("Failed to fetch new email:", error);
            showNotification("Error generating sample email.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        generateNewAddress();
    }, [generateNewAddress]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (currentEmail) {
               fetchNewEmail();
            }
        }, 15000); // Fetch a new email every 15 seconds

        return () => clearInterval(interval);
    }, [currentEmail, fetchNewEmail]);

    const handleSelectEmail = (email: Email) => {
        setSelectedEmail(email);
        setEmails(emails.map(e => e.id === email.id ? { ...e, read: true } : e));
    };

    const handleDeleteEmail = (emailId: string) => {
        setEmails(emails.filter(e => e.id !== emailId));
        if (selectedEmail?.id === emailId) {
            setSelectedEmail(null);
        }
        showNotification("Email deleted.");
    };
    
    const handleDeleteAllEmails = () => {
        setEmails([]);
        setSelectedEmail(null);
        showNotification("All emails deleted.");
    };


    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto p-4 flex flex-col gap-4">
                <EmailDisplay 
                    emailAddress={currentEmail} 
                    onNewAddress={generateNewAddress} 
                    onRefresh={fetchNewEmail}
                    onCopy={() => showNotification("Email address copied!")}
                    isRefreshing={isLoading}
                />
                <InboxPanel 
                    emails={emails}
                    selectedEmail={selectedEmail}
                    onSelectEmail={handleSelectEmail}
                    onDeleteEmail={handleDeleteEmail}
                    onDeleteAllEmails={handleDeleteAllEmails}
                    onBack={() => setSelectedEmail(null)}
                />
            </main>
            {notification && <Notification message={notification} />}
        </div>
    );
};

export default App;
