import React, { Component } from 'react';
import PropTypes from 'prop-types';
import NoteList from './noteList';
import { db, auth } from '../firebase';
import MenuBottomToolbar from './menuBottomToolbar';
import MenuSearch from './menuSearch';
import Scrollable from './scrollable';
import './menu.css';

class Menu extends Component {
    constructor(props) {
        super(props);

        this.state = {
            searchQuery: '',
            notes: []
        }

        this.onSearchChange = this.onSearchChange.bind(this);
        this.onNotesUpdate = this.onNotesUpdate.bind(this);
    }

    componentDidMount() {
        const userID = auth.currentUser.uid;

        this.notesRef = db.ref(`${userID}/notes`);
        this.notesRef.on('value', this.onNotesUpdate);
    }

    onNotesUpdate(snapshot) {
        const notes = snapshot.val();
        if ( ! notes) {
            this.setState({ notes: [] });
            return;
        };

        this.setState({
            notes: Object.keys(notes)
            .map(key => {
                const note = notes[key];

                const rawText = note
                .content
                .replace(/<(\s|\S)*?>/g, ' ')
                .replace(/\n/g, ' ');

                const title = note
                .content
                .replace(/<(\s|\S)*?>/g, '|')
                .split('|')
                .find(s => s.length > 0) || '';

                return {
                    key,
                    title,
                    rawText,
                    ...note
                }
            })
            .sort((a, b) => a.lastUpdate < b.lastUpdate)
        });
    }

    onSearchChange(q) {
        this.setState({ searchQuery: q })
    }

    render() {
        const className = "menu " +
            (this.props.className || '');

        const notes = this.state
        .notes
        .filter(n => ! this.state.searchQuery || n.rawText.toLowerCase().indexOf(this.state.searchQuery.toLowerCase()) !== -1);

        return (
            <aside className={className}>
                <Scrollable className="menu__main">
                    <h2>Notes</h2>
                    <MenuSearch onChange={this.onSearchChange} />
                    <NoteList notes={notes} />
                </Scrollable>
                <MenuBottomToolbar
                    goToNewNote={this.props.goToNewNote}
                    goToAbout={this.props.goToAbout} />
            </aside>
        )
    }
}

Menu.propTypes = {
    className: PropTypes.string,
    goToNewNote: PropTypes.func.isRequired
};

export default Menu;