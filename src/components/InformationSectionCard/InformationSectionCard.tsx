import React from 'react';
import { Link } from 'react-router-dom';
import './InformationSectionCard.scss';

export interface InformationSectionCardProps {
    sectionKey: string;
    title: string;
    description: string;
    completed: boolean;
    required: boolean;
    linkTo: string;
}

export const InformationSectionCard: React.FC<InformationSectionCardProps> = ({
    title,
    description,
    completed,
    required,
    linkTo,
}) => {
    return (
        <Link to={linkTo} className={`info-section-card ${completed ? 'info-section-card--completed' : ''}`}>
            <div className="info-section-card__header">
                <h4>{title}</h4>
                <div className="info-section-card__badges">
                    {required && !completed && (
                        <span className="badge badge--required">Required</span>
                    )}
                    {!required && (
                        <span className="badge badge--optional">Optional</span>
                    )}
                    {completed && (
                        <span className="badge badge--completed">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                                    fill="currentColor"
                                />
                            </svg>
                            Completed
                        </span>
                    )}
                </div>
            </div>
            <p className="info-section-card__description">{description}</p>
            <div className="info-section-card__action">
                {completed ? 'Review & Edit' : 'Complete Now'} →
            </div>
        </Link>
    );
};
