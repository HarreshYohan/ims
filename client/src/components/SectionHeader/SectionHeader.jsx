import './SectionHeader.css';

export const SectionHeader = ({section, is_create=false}) => {

    return (
    <div className='bar'>
        <p>
            {section}
            {is_create && <button className="create-button">Create</button>}
        </p>
    </div>
    );
};
