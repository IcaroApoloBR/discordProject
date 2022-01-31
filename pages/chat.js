import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React from 'react';
import { FaShareSquare } from 'react-icons/fa';
import appConfig from '../config.json';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js'
import { ButtonSendSticker } from '../src/components/ButtonSendSticker';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzI5NzEwNCwiZXhwIjoxOTU4ODczMTA0fQ.Ov9CRyGP7fi8UnUT0ulW2gFkdORhiPHBPZJfO5cJDsQ';
const SUPABASE_URL = 'https://xmhrijydsbfxkvamjdsv.supabase.co';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function escutaMensagemEmTempoReal(adicionaMensagem) {
    return supabaseClient
        .from('message')
        .on('INSERT', (respostaLive) => {
            adicionaMensagem(respostaLive.new);
        })
        .subscribe();
}

export default function ChatPage() {
    const routes = useRouter();
    const userLogin = routes.query.username;
    const [message, setMessage] = React.useState('');
    const [listMessage, setListMessage] = React.useState([]);

    React.useEffect(() => {
        supabaseClient
            .from('message')
            .select('*')
            .order('id', { ascending: false })
            .then(({ data }) => {
                setListMessage(data);
            });

        escutaMensagemEmTempoReal((newMessage) => {
            setListMessage((valorAtualDaLista) => {
                return [
                    newMessage,
                    ...valorAtualDaLista,
                ]
            });
        });
    }, []);

    function handleNewMessage(newMessage) {
        const message = {
            from: userLogin,
            text: newMessage,
        };

        supabaseClient
            .from('message')
            .insert([
                message
            ])
            .then(({ data }) => {
                console.log('Criando mensagem: ', data);
            });

        setMessage('');
    }

    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: appConfig.theme.colors.primary[500],
                backgroundImage: `url(https://images.unsplash.com/photo-1516116216624-53e697fedbea?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=928&q=80)`,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: 'rgba(14, 17, 22, 0.5)',
                    //backgroundColor: appConfig.theme.colors.neutrals[700],
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >

                    <MessageList message={listMessage} />

                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            value={message}
                            onChange={(event) => {
                                const value = event.target.value;
                                setMessage(value);
                            }}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    handleNewMessage(message);
                                }
                            }}
                            placeholder="Send your message here..."
                            type="textarea"
                            styleSheet={{
                                width: '100%',
                                height: '40px',
                                resize: 'none',
                                borderRadius: '2px',
                                backgroundColor: 'rgba(14, 17, 22, 0.5)',
                                //backgroundColor: appConfig.theme.colors.neutrals[400],
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />
                        <ButtonSendSticker
                            onStickerClick={(sticker) => {
                                handleNewMessage(':sticker: ' + sticker);
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading5'>
                    Chat Room
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label={< FaShareSquare />}
                    //label='Logout'
                    href="/"
                    styleSheet={{
                        borderRadius: '5px',
                        minWidth: '42px',
                        minHeight: '42px',
                        marginRight: '20px',
                        backgroundColor: appConfig.theme.colors.primary[900],
                        color: appConfig.theme.colors.neutrals[100],
                    }}

                />
            </Box>
        </>
    )
}

function MessageList(props) {
    return (
        <Box
            tag="ul"
            styleSheet={{
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >
            {props.message.map((message) => {
                return (
                    <Text
                        key={message.id}
                        tag="li"
                        styleSheet={{
                            borderRadius: '5px',
                            padding: '6px',
                            marginBottom: '12px',
                            hover: {
                                backgroundColor: appConfig.theme.colors.neutrals[700],
                            }
                        }}
                    >
                        <Box
                            styleSheet={{
                                marginBottom: '8px',
                            }}
                        >
                            <Image
                                styleSheet={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    marginRight: '8px',
                                }}
                                src={`https://github.com/${message.from}.png`}
                            />
                            <Text tag="strong">
                                {message.from}
                            </Text>
                            <Text
                                styleSheet={{
                                    fontSize: '10px',
                                    marginLeft: '8px',
                                    color: appConfig.theme.colors.neutrals[300],
                                }}
                                tag="span"
                            >
                                {(new Date().toLocaleDateString())}
                            </Text>

                        </Box>
                        {message.text.startsWith(':sticker:')
                            ? (
                                <Image src={message.text.replace(':sticker:', '')} 
                                styleSheet={{
                                    width: '150px',
                                }}
                                />
                            )
                            : (
                                message.text
                            )}
                    </Text>
                );
            })}
        </Box>
    )
}