
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
            secret: "ew0KICAiYWxnIjogIlJTMjU2IiwNCiAgImtpZCI6ICJMaXMyNEY4cUFxa2VQeW1ZUk9xVzd3anJKdFEiLA0KICAieDV0IjogIkxpczI0RjhxQXFrZVB5bVlST3FXN3dqckp0USIsDQogICJ0eXAiOiAiSldUIg0KfQ.ew0KICAiYm90IjogIlRFU1QtU0FNLUJPVCIsDQogICJzaXRlIjogImFkbEtoSk9vLVYwIiwNCiAgImNvbnYiOiAiNXd3M3ozQWtNSDE0WWlacENyN2xDOC1uIiwNCiAgInVzZXIiOiAiZGxfMTRiMWVjZmFkZGUxYWQyZTllYWFmN2EwMWU0YjgxOTAiLA0KICAibmJmIjogMTU5MDQ1NDUyOCwNCiAgImV4cCI6IDE1OTA0NTgxMjgsDQogICJpc3MiOiAiaHR0cHM6Ly9kaXJlY3RsaW5lLmJvdGZyYW1ld29yay5jb20vIiwNCiAgImF1ZCI6ICJodHRwczovL2RpcmVjdGxpbmUuYm90ZnJhbWV3b3JrLmNvbS8iDQp9.jiL5ywHrMb1-Qn1pWffeApxgB2MfHVab00TuZJXsAyoIAbh0bMcAbhxtt1veVTRCAyqDKmfRcYaycO0LAVegEO12PrThAvI584hCLuMaaz1eov9S3aSxolQZIJUb2t62aGm5AGvCPBYXaganKeb6bclGSSsli_CwKwe8YB5Q0eDFdimF5WdpAXgfpjCW6B1G_Al2kvFwbrpmzGihsQUPqqO-OZrJ49EsqZ0b6sxP90fL5w5acxHporrExhncmtYJv1pZompMoDGXLj05K4LsHhohZzylhzsrndZ6meq9i4j6Op6i4_yKL0xopc0KxQUZkCuZ7ydCOqAuUcP_epMIKg"
              
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

