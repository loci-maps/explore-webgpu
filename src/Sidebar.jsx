import { React, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';

const drawerWidth = '20%';

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  toolbar: {
    ...theme.mixins.toolbar,
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing(2),
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  formControl: {
    marginBottom: theme.spacing(2),
    minWidth: '100%',
  },
  button: {
    marginBottom: theme.spacing(2),
  },
}));

const Sidebar = ({ meshValue, setMeshValue }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [selectValue, setSelectValue] = useState('');
  const assetFiles = ['pca5_island.obj', 'pca5_island.gltf', 'tsne2_island.gltf', 'umap2_island.gltf', 'umap5_island.gltf']; // Replace with actual file names from the 'assets' directory

  const handleConfigureClick = () => {
    setOpen(!open);
  };

  const handleApplyClick = () => {
    // Perform action when Apply button is clicked
    setMeshValue(selectValue)
    console.log(meshValue);
    // Add your logic here
  };

  return (
    <Drawer
      className={classes.drawer}
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
      anchor="left"
    >
      <div className={classes.toolbar}>
        <h2>Loci Maps</h2>
      </div>
      <List>
        <ListItem button onClick={handleConfigureClick}>
          <ListItemText primary="Configure" />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button className={classes.nested}>
              <FormControl className={classes.formControl}>
                <InputLabel id="mesh-select-label">Mesh</InputLabel>
                <Select
                  labelId="mesh-select-label"
                  id="mesh-select"
                  value={meshValue}
                  onChange={(event) => setSelectValue(event.target.value)}
                >
                  {assetFiles.map((asset, index) => (
                    <MenuItem
                      key={index}
                      value={asset}
                    >
                      {asset}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </ListItem>
            <ListItem button className={classes.nested}>
              <Button
                variant="contained"
                color="primary"
                className={classes.button}
                onClick={handleApplyClick}
              >
                Apply
              </Button>
            </ListItem>
          </List>
        </Collapse>
        <ListItem button>
          <ListItemText primary="Tasks" />
        </ListItem>
        <List component="div" disablePadding>
          <ListItem button className={classes.nested}>
            <Checkbox checked={false} />
            <ListItemText primary="Task 1" />
          </ListItem>
          <ListItem button className={classes.nested}>
            <Checkbox checked={false} />
            <ListItemText primary="Task 2" />
          </ListItem>
          <ListItem button className={classes.nested}>
            <Checkbox checked={false} />
            <ListItemText primary="Task 3" />
          </ListItem>
        </List>
      </List>
    </Drawer>
  );
};

export default Sidebar;
