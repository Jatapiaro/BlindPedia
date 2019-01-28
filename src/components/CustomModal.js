import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

export default class CustomModal extends React.Component {

    toggle = () => {
        const e = {
            keyCode: 27
        };
        this.props.handleKeyDown(e);
    }

    render() {
        return (
            <div>
                <Modal isOpen={this.props.modal.open} toggle={this.toggle} className="modal-full">
                    <ModalHeader toggle={this.toggle}>{this.props.modal.title}</ModalHeader>
                    <ModalBody>
                        {
                            this.props.modal.content
                        }
                    </ModalBody>
                </Modal>
            </div>
        );
    }

}

CustomModal.defaultProps = {
    modal: {
        open: false,
        title: '',
        content: ''
    }
}
