import React from 'react';
import ConsentModal from './consent-modal';
import { getPurposes } from 'utils/config';
import { language } from 'utils/i18n';

export default class ConsentNotice extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            confirming: false,
        };
    }

    executeButtonClicked = (setChangedAll, changedAllValue) => {
        const { modal } = this.state;
        if (setChangedAll) this.props.manager.changeAll(changedAllValue);
        const confirmed = this.props.manager.confirmed;
        const saveAndHide = () => {
            this.setState({ confirming: false });
            this.props.manager.saveAndApplyConsents();
            this.props.hide();
        };
        if (
            setChangedAll &&
            !confirmed &&
            (modal || this.props.config.mustConsent)
        ) {
            this.setState({ confirming: true });
            setTimeout(saveAndHide, 1000);
        } else saveAndHide();
    };

    saveAndHide = () => {
        this.executeButtonClicked(false, false);
    };

    acceptAndHide = () => {
        this.executeButtonClicked(true, true);
    };

    declineAndHide = () => {
        this.executeButtonClicked(true, false);
    };

    render() {
        const { config, show, manager, t } = this.props;
        const { modal, confirming } = this.state;
        const lang = config.lang || language();

        const purposes = getPurposes(config);
        const purposesText = purposes
            .map((purpose) => t(['purposes', purpose]))
            .join(', ');

        let changesText;

        const showModal = (e) => {
            e.preventDefault();
            this.setState({ modal: true });
        };

        const hideModal = () => {
            if (manager.confirmed) this.props.hide();
            else this.setState({ modal: false });
        };

        const ppUrl =
            (config.privacyPolicy && config.privacyPolicy[lang]) ||
            config.privacyPolicy.default ||
            config.privacyPolicy;

        const ppLink = (
            <a href={ppUrl}>{t(['consentModal', 'privacyPolicy', 'name'])}</a>
        );

        if (manager.changed)
            changesText = (
                <p className="cn-changes">
                    {t(['consentNotice', 'changeDescription'])}
                </p>
            );

        if (!show) return <div />;

        const declineButton = config.hideDeclineAll ? (
            ''
        ) : (
            <button
                className="btn btn-sm cn-decline"
                type="button"
                onClick={this.declineAndHide}
            >
                {t(['decline'])}
            </button>
        );

        const acceptButton = config.acceptAll ? (
            <>
                <button
                    className="btn btn-sm btn-primary btn-primary cn-acceptAll"
                    type="button"
                    onClick={this.acceptAndHide}
                >
                    {t(['acceptAll'])}
                </button>
                {config.acceptDefault && (
                    <button
                        className="btn btn-sm btn-primary btn-primary cn-OK"
                        type="button"
                        onClick={this.saveAndHide}
                    >
                        {t(['ok'])}
                    </button>
                )}
            </>
        ) : (
            <button
                className="btn btn-sm btn-primary btn-primary cn-OK"
                type="button"
                onClick={this.saveAndHide}
            >
                {t(['ok'])}
            </button>
        );

        const noticeIsVisible =
            !config.mustConsent && !manager.confirmed && !config.noNotice;

        if (
            modal ||
            manager.confirmed ||
            (!manager.confirmed && config.mustConsent)
        )
            return (
                <ConsentModal
                    t={t}
                    confirming={confirming}
                    config={config}
                    hide={hideModal}
                    declineAndHide={this.declineAndHide}
                    saveAndHide={this.saveAndHide}
                    acceptAndHide={this.acceptAndHide}
                    manager={manager}
                />
            );
        return (
            <div
                className={`cookie-notice ${
                    !noticeIsVisible ? 'cookie-notice-hidden' : ''
                }`}
            >
                <div className="cn-body">
                    <p>
                        {t(['consentNotice', 'description'], {
                            purposes: <strong>{purposesText}</strong>,
                            privacyPolicy: ppLink,
                        })}
                    </p>
                    {changesText}
                    <p className="cn-ok">
                        {declineButton}
                        {acceptButton}
                        <a
                            className="cm-link cm-learn-more"
                            href="#"
                            onClick={showModal}
                        >
                            {t(['consentNotice', 'learnMore'])}...
                        </a>
                    </p>
                </div>
            </div>
        );
    }
}
