import React from 'react'
import { Offcanvas } from 'react-bootstrap'
import SvgIcons from '../../../components/SVGIcons'

const HelpDeskHeader = () => {
    return (
        <Offcanvas.Header closeButton className='border-bottom mb-4 align-items-start'>
            <Offcanvas.Title as="div" className="d-flex gap-2 align-items-center">
                <span className='align-items-center bg-warning custom-height-80 custom-width-80 d-inline-flex justify-content-center rounded-pill text-white'>
                    {SvgIcons.RobotIcon(40, 40)}
                </span>
                <div className='text-uppercase fw-medium'>
                    <div className='custom-font-size-18 lh-sm mb-0'>Welcome to the </div>
                    <div className='custom-font-size-26 lh-sm mb-0'>SEPS Helpdesk</div>
                </div>
            </Offcanvas.Title>
        </Offcanvas.Header>
    )
}

export default HelpDeskHeader