
import React from 'react';
import ReactDOM from 'react-dom';
import { Chat, HeroCard } from '@progress/kendo-react-conversational-ui';
import { DirectLine } from 'botframework-directlinejs';
import * as AdaptiveCards from "adaptivecards";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = { messages: [] };
        this.client = new DirectLine({
            secret: "ew0KICAiYWxnIjogIlJTMjU2IiwNCiAgImtpZCI6ICJMaXMyNEY4cUFxa2VQeW1ZUk9xVzd3anJKdFEiLA0KICAieDV0IjogIkxpczI0RjhxQXFrZVB5bVlST3FXN3dqckp0USIsDQogICJ0eXAiOiAiSldUIg0KfQ.ew0KICAiYm90IjogIlRFU1QtU0FNLUJPVCIsDQogICJzaXRlIjogImFkbEtoSk9vLVYwIiwNCiAgImNvbnYiOiAiNHRpVDJvRTd4eUdJbFZaUkk5ZXFJVC1uIiwNCiAgInVzZXIiOiAiZGxfZTYyYjRkZTliMDQ1ZGU1NTc2MWQ3M2JhMDM0N2RmOTQiLA0KICAibmJmIjogMTU5MDQ1NjI5MCwNCiAgImV4cCI6IDE1OTA0NTk4OTAsDQogICJpc3MiOiAiaHR0cHM6Ly9kaXJlY3RsaW5lLmJvdGZyYW1ld29yay5jb20vIiwNCiAgImF1ZCI6ICJodHRwczovL2RpcmVjdGxpbmUuYm90ZnJhbWV3b3JrLmNvbS8iDQp9.iDclTj7ALqq-QOior40vSRts6vUTwAKILI0Ia2qqR_EugOZkLPB6wcKbHhsF6dU_I2OQ-ppT3u18p5H5cAMLxexxTJs8dX2wLMzyCZwlt-BGdLbTHbTEtfn0vM-O7bisiyQnxIZk9SOjLik_n5IQwSO9BYmnA3-lZwyZH6Yw1uCgy1MolSlAMF_8G1JWgFGPKZW9_o8N47VRad39Rz6AZ8GYgVQfNIWnc-891vpqK_4dXnGkhvFI1OkVs1yQh5hJhQwju9JqHvcqj43AtcsjTesGCJ2lN1E1C9Us1_VV0-2YPewnCPKoFX2E7g101M2vx5Dz-bkiFL6HM-pjo9zZGg"
              
        });
        this.client.activity$.subscribe(
              activity => this.onResponse(activity)
        );
        this.user = {
            id: 'dl_14b1ecfadde1ad2e9eaaf7a01e4b8190'
        };
        this.bot = {
            id: 'TEST-SAM-BOT',
            name: 'Bot',
            avatarUrl:'https://lh3.googleusercontent.com/PC7tBKOfQRCwjiMjVlFiImEYRKnWn6z_VSOEEmodf-E6In-GApzNmMiO6INBfHh5d1M=s180'
            // avatarUrl: 'https://demos.telerik.com/kendo-ui/content/chat/VacationBot.png'
        };
        this.addNewMessage = this.addNewMessage.bind(this);
    }

    аttachmentTemplate = (props) => {
        let attachment = props.item;
        if (attachment.contentType === "application/vnd.microsoft.card.hero") {
            return <HeroCard
                title={attachment.content.title || attachment.content.text}
                subtitle={attachment.content.subtitle}
                imageUrl={attachment.content.images ? attachment.content.images[0].url : ""}
                imageMaxWidth="250px"
                actions={attachment.content.buttons}
                onActionExecute={this.addNewMessage} />;
        } else if (attachment.contentType === "application/vnd.microsoft.card.adaptive") {
            let adaptiveCard = new AdaptiveCards.AdaptiveCard();
            adaptiveCard.parse(attachment.content);
            let renderedCard = adaptiveCard.render();
            let htmlToinsert = { __html: renderedCard.innerHTML };
            return <div dangerouslySetInnerHTML={htmlToinsert} />;
        } else {
            return (
                <div className="k-card">
                    {attachment.content}
                </div>
            );
        }
    }

    parseActions = (actions) => {
        if (actions !== undefined ) {
            actions.actions.map(action => {
                if (action.type === 'imBack') {
                    action.type = 'reply';
                }
            });
            return actions.actions;
        }
        return [];
    }

    parseText = ( event ) => {
        if (event.action !== undefined) {
            return event.action.value;
        } else if ( event.value ) {
            return event.value;
        } else {
            return event.message.text;
        }
    }

    onResponse = (activity) => {
        let newMsg;
        if (activity.from.id === this.bot.id) {
            newMsg = {
                text: activity.text,
                author: this.bot,
                typing: activity.type === "typing",
                timestamp: new Date(activity.timestamp),
                suggestedActions: this.parseActions(activity.suggestedActions),
                attachments: activity.attachments ? activity.attachments : []
            };

            this.setState((prevState) => {
                return { messages: [...prevState.messages, newMsg] };
            });
        }
    }

    addNewMessage = (event) => {
        let value = this.parseText(event);
        this.client.postActivity({
            from: { id: this.user.id, name: this.user.name },
            type: 'message',
            text: value
        }).subscribe(
            id => console.log("Posted activity, assigned ID ", id),
            error => console.log("Error posting activity", error)
        );
        if (!event.value) {
            this.setState((prevState) => {
                return { messages: [...prevState.messages, { author: this.user, text: value, timestamp: new Date() }] };
            });
        }
    };

    render() {
        return (
            <Chat
                messages={this.state.messages}
                user={this.user}
                onMessageSend={this.addNewMessage}
                attachmentTemplate={this.аttachmentTemplate}
            />
        );
    }
}

ReactDOM.render(
    <App />,
    document.querySelector('my-app')
);

