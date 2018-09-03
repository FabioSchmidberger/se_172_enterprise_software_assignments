======
Ansile
======

How To Run
==========

Run the deployment play:

.. code::

    sudo ansible-playbook -i hosts.conf hello-world-webserver.yml --tags "undeploy"

Run the teardown play:

.. code::

    sudo ansible-playbook -i hosts.conf hello-world-webserver.yml --tags "undeploy"
