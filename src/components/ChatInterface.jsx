
















































































































++import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Users, User, ChevronDown } from 'lucide-react';

const ChatInterface = ({
    isOpen,
    onClose,
    context,
    recipients = [],
    onSendMessage
}) => {
    const [chatMode, setChatMode] = useState('single'); // 'single' or 'broadcast'
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [showRecipients, setShowRecipients] = useState(false);
    const messagesEndRef = useRef(null);

    // Scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-set chat mode based on recipients
    useEffect(() => {
        if (recipients.length === 1) {
            setChatMode('single');
        }
    }, [recipients]);

    const handleSendMessage = () => {
        if (!message.trim()) return;

        const newMessage = {
            id: Date.now(),
            text: message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender: 'ministry',
            mode: chatMode,
            recipientCount: chatMode === 'broadcast' ? recipients.length : 1
        };

        setMessages(prev => [...prev, newMessage]);
        setMessage('');

        // Call parent handler
        if (onSendMessage) {
            onSendMessage(newMessage, chatMode === 'broadcast' ? recipients : [context.state]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const getHeaderTitle = () => {
        if (chatMode === 'broadcast') {
            return `Broadcast to ${recipients.length} State${recipients.length !== 1 ? 's' : ''}`;
        }

        const parts = [];
        if (context.state && context.state !== 'all') parts.push(context.state);
        if (context.component && context.component !== 'all') parts.push(context.component);
        if (context.status && context.status !== 'all') parts.push(context.status);

        return parts.length > 0 ? parts.join(' • ') : 'All States';
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '25%',
            minWidth: '350px',
            height: '100vh',
            backgroundColor: '#fff',
            boxShadow: '-4px 0 16px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            borderLeft: '1px solid #E0E0E0'
        }}>
            {/* Header */}
            <div style={{
                backgroundColor: '#25D366',
                color: 'white',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minHeight: '64px'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s',
                        borderRadius: '50%'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.8';
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Go Back"
                >
                    <ArrowLeft size={24} />
                </button>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '2px' }}>
                        {getHeaderTitle()}
                    </div>
                    {chatMode === 'broadcast' && (
                        <div
                            style={{
                                fontSize: '12px',
                                opacity: 0.9,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                            onClick={() => setShowRecipients(!showRecipients)}
                        >
                            <Users size={14} />
                            Click to see recipients
                            <ChevronDown size={14} />
                        </div>
                    )}
                </div>
            </div>

            {/* Recipients Dropdown */}
            {showRecipients && chatMode === 'broadcast' && (
                <div style={{
                    backgroundColor: '#E8F5E9',
                    padding: '12px 16px',
                    maxHeight: '150px',
                    overflowY: 'auto',
                    borderBottom: '1px solid #ddd'
                }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                        Broadcasting to:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {recipients.map((state, index) => (
                            <span key={index} style={{
                                backgroundColor: '#25D366',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '500'
                            }}>
                                {state}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Mode Selector */}
            {recipients.length > 1 && (
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#F5F5F5',
                    borderBottom: '1px solid #E0E0E0',
                    display: 'flex',
                    gap: '8px'
                }}>
                    <button
                        onClick={() => setChatMode('single')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: chatMode === 'single' ? '#25D366' : 'white',
                            color: chatMode === 'single' ? 'white' : '#666',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                            boxShadow: chatMode === 'single' ? '0 2px 4px rgba(37, 211, 102, 0.3)' : 'none'
                        }}
                    >
                        <User size={16} />
                        Single
                    </button>
                    <button
                        onClick={() => setChatMode('broadcast')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: chatMode === 'broadcast' ? '#25D366' : 'white',
                            color: chatMode === 'broadcast' ? 'white' : '#666',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                            boxShadow: chatMode === 'broadcast' ? '0 2px 4px rgba(37, 211, 102, 0.3)' : 'none'
                        }}
                    >
                        <Users size={16} />
                        Broadcast ({recipients.length})
                    </button>
                </div>
            )}

            {/* Messages Container */}
            <div style={{
                flex: 1,
                padding: '16px',
                overflowY: 'auto',
                backgroundColor: '#E5DDD5',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23e5ddd5\'/%3E%3Cpath d=\'M25 25l5-5M75 25l5-5M25 75l5-5M75 75l5-5\' stroke=\'%23000\' stroke-opacity=\'0.02\' stroke-width=\'2\'/%3E%3C/svg%3E")'
            }}>
                {messages.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        color: '#888',
                        marginTop: '40px',
                        fontSize: '14px'
                    }}>
                        <div style={{ marginBottom: '8px', fontSize: '48px' }}>💬</div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>Start a conversation</div>
                        {chatMode === 'broadcast' && (
                            <div style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
                                Messages will be sent to <strong>{recipients.length}</strong> state{recipients.length !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} style={{
                            marginBottom: '12px',
                            display: 'flex',
                            justifyContent: msg.sender === 'ministry' ? 'flex-end' : 'flex-start'
                        }}>
                            <div>
                                <div style={{
                                    backgroundColor: msg.sender === 'ministry' ? '#DCF8C6' : 'white',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    maxWidth: '260px',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}>
                                    <div style={{ fontSize: '14px', color: '#333', wordBreak: 'break-word' }}>
                                        {msg.text}
                                    </div>
                                    <div style={{
                                        fontSize: '11px',
                                        color: '#667781',
                                        marginTop: '4px',
                                        textAlign: 'right',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        gap: '4px'
                                    }}>
                                        {msg.timestamp}
                                        {msg.mode === 'broadcast' && (
                                            <span style={{
                                                backgroundColor: '#25D366',
                                                color: 'white',
                                                padding: '2px 6px',
                                                borderRadius: '8px',
                                                fontSize: '10px',
                                                marginLeft: '4px'
                                            }}>
                                                Broadcast
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
                padding: '12px 16px',
                backgroundColor: '#F0F0F0',
                borderTop: '1px solid #E0E0E0',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-end'
            }}>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={chatMode === 'broadcast' ? `Broadcast to ${recipients.length} states...` : 'Type a message...'}
                    style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: '20px',
                        border: '1px solid #DDD',
                        resize: 'none',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        minHeight: '42px',
                        maxHeight: '120px',
                        outline: 'none'
                    }}
                    rows={1}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    style={{
                        backgroundColor: message.trim() ? '#25D366' : '#CCC',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '42px',
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: message.trim() ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                        flexShrink: 0,
                        boxShadow: message.trim() ? '0 2px 4px rgba(37, 211, 102, 0.3)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                        if (message.trim()) {
                            e.currentTarget.style.backgroundColor = '#20BA5A';
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (message.trim()) {
                            e.currentTarget.style.backgroundColor = '#25D366';
                            e.currentTarget.style.transform = 'scale(1)';
                        }
                    }}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

export default ChatInterface;
