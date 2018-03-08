import React from "react";
import firebase from "firebase/app";

export default class Card extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            answers: 0
        };
    }

    componentWillMount() {
        this.props.usersSnap.forEach(userSnap => {
            let user = userSnap.val();
            if (user.index === this.props.userIndex) {
                this.setState({questionAsker: user.questionAsker})
                this.setState({uid: user.uid})
            }
        })
        this.setState({card: this.props.cardSnap.val()})
    }

    handleClick(evt, num) {
        evt.preventDefault();
        if(!this.state.questionAsker) {
            //if(this.state.answers < 1) {
                //this.state.answers++;
                let ref = firebase.database().ref(`gameState/currResponses`);
                ref.push({card: this.state.card}) // pass card data
                    .catch(err => this.setState({fbError: err}));
            //}
            firebase.database().ref(`gameState/currAnswerIndex`).once("value", snapshot => {
                let currNextIndex = snapshot.val();
                this.props.usersSnap.forEach(userSnap => {
                    let i = 0;
                    userSnap.child("cards").forEach(cardSnap => {
                        i++;
                        if(cardSnap.val() === num) {
                            
                            this.props.whiteCardsRef.once("value", cardSnapshot => {
                                cardSnapshot.forEach(whiteCardSnap => {
                                    let whiteCard = whiteCardSnap.val();
                                    if(whiteCard.index === currNextIndex) {
                                        let nextIndexCardSnap = whiteCardSnap;
                                        let key = whiteCardSnap.key;
                                        firebase.database().ref(`cards/white_cards/${key}/playerIndex`).set(this.props.userIndex);
                                        let cardObj = {
                                            userID: this.props.userID,
                                            whiteCardsRef: this.props.whiteCardsRef,
                                            cardSnap: nextIndexCardSnap,
                                            userIndex: this.props.userIndex
                                        }
                                        this.props.replaceCardAtIndex(num, cardObj);
                                        let cardStr = "card" + i;
                                        firebase.database().ref(`users/${this.state.uid}/cards/${cardStr}`).set(currNextIndex);
                                        let nextIndex = currNextIndex + 1;
                                        firebase.database().ref(`gameState/currAnswerIndex`).set(nextIndex);
                                    } 
                                })
                            })
                        }
                    })
                })
            }) 
        }
    }


    render() {
        let answer = this.props.cardSnap.val();
        return (
            <div className="white-card col mr-2" onClick={evt => this.handleClick(evt, answer.index)}>
                {answer.answer}
            </div>
        );
    }
}
