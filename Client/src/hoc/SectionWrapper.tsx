import React from "react";
import { motion } from "framer-motion";
import { staggerContainer } from "../util/motion";

export const SectionWrapper = <P extends object>(
    Component: React.ComponentType<P>
) => {
    const HOC: React.FC<P> = (props) => (
        <motion.section
            variants={staggerContainer(0.25, 0)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className=" max-w-7xl mx-auto relative z-0"
        >

            <Component {...props} />
        </motion.section>
    );


    return HOC;
};
export default SectionWrapper