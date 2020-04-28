import React, { useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

library.add(fas);

const Lesson = ({ id, title, completed, chapter, onRemove, onEdit, onComplete }) => {
	const [classNames, setClassNames] = useState(completed ? 'completed' : '');

	const onChangeCheckbox = e => {
		onComplete(chapter.id, id, e.target.checked);
		setClassNames(e.target.checked ? 'completed' : '');
	};

	return (
		<div key={ id } className='lessons__items-row'>
			<div className='checkbox'>
				<input id={ `lesson-${ id }` }
				       type='checkbox'
				       checked={ completed }
				       onChange={ onChangeCheckbox }/>
				<label htmlFor={ `lesson-${ id }` }>
					<FontAwesomeIcon className='lessons__items-row__complete-button'
					                 icon='check'/>
				</label>
			</div>
			<p className={ classNames }>{ title }</p>
			<div className='lessons__items-row-actions'>
				<div onClick={ () => onEdit(chapter.id, { id, title }) }>
					<FontAwesomeIcon className={ 'lessons__items-row-actions__edit-button' }
					                 icon={ 'pen' }/>
				</div>
				<div onClick={ () => onRemove(chapter.id, id) }>
					<FontAwesomeIcon className={ 'lessons__items-row-actions__remove-button' }
					                 icon={ 'times' }/>
				</div>
			</div>
		</div>
	);
};

export default Lesson;
