
import Typography from "@mui/material/Typography"
import  Container  from "@mui/material/Container";
import Box from "@mui/material/Box"
import ImageCollage from "../components/ImageCollage"
import CustomizedAccordions from "../components/Accordion";
import  Paper  from "@mui/material/Paper";
import  BottomNavigation  from "@mui/material/BottomNavigation";
import BasicModal from "../components/Modal";

const Tour = () => <Container sx={{width: 900}}>
    <Typography variant="h3" component="h1" marginTop={3}>
        Explore the world
    </Typography>
    <Box marginTop ={3} sx={{display:"Flex"}}>
        <img src="https://imageio.forbes.com/specials-images/imageserve/656df61cc3a44648c235dde3/Las-Vegas--Nevada--USA-at-the-Welcome-Sign/960x0.jpg?format=jpg&width=960" alt="" height={325}/>
        <ImageCollage/>
    </Box>
    <Box>
    <Typography variant="h6" component="h4" marginTop={3}>
        About this ticket
    </Typography>
    <Typography variant="paragraph" component="p" marginTop={3}>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quaerat iste officiis sapiente nihil minima ab molestias minus enim dolorum voluptatem pariatur sit recusandae, saepe aliquid et odit excepturi ipsum nam.
    </Typography>
    </Box>
    <Box marginBottom={10}>
    <Typography variant="h6" component="h4" marginTop={3} marginBottom={2}>
        Frequently asked questions?
    </Typography>
    <CustomizedAccordions/>
    </Box>
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation>
         <BasicModal/>
        </BottomNavigation>
      </Paper>
</Container>

export default Tour;